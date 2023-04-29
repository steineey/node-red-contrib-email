module.exports = function (RED) {
    const nodemailer = require("nodemailer");

    function EmailTransport(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.transporter = nodemailer.createTransport({
            host: config.host,
            port: parseInt(config.port, 10),
            auth: { ...node.credentials },
            secure: config.secure,
        });
    }
    RED.nodes.registerType("email-transport", EmailTransport, {
        credentials: {
            user: { type: "text" },
            pass: { type: "password" },
        },
    });

    function EmailSend(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const transport = RED.nodes.getNode(config.transport);
        if (!transport) {
            node.error("transport undefined");
            return;
        }

        // smtp transporter
        const transporter = transport.transporter;

        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                node.error(error);
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: "connection test failed",
                });
            } else {
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: "connection test success",
                });
            }
        });

        node.on("input", function (msg, send, done) {
            const mail = {
                from: config.from || msg.from,
                to: config.to || msg.to,
                cc: config.cc || msg.cc,
                bcc: config.bcc || msg.bcc,
                subject: config.subject || msg.subject,
                attachments: msg.attachments,
                text: msg.text,
                html: msg.html,
            };

            if (config.contentType === "html") {
                mail.html = msg.payload;
            } else {
                mail.text = msg.payload;
            }

            transporter.sendMail(mail, function (err, info) {
                if (err) {
                    done(err);
                    return;
                }
                msg.info = info;
                send(msg);
                done();
            });
        });
    }
    RED.nodes.registerType("email-send", EmailSend);
};
