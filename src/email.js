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
            proxy: config.proxy || undefined,
        });

        node.transporter.on("error", (err)=> {
            console.log("ERROR", err);
        })

        node.on("close", function (removed, done) {
            done = done || function () {};
            node.transporter.close();
            done();
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

        // request counter
        const counter = {
            success: 0,
            error: 0,
        };

        // smtp transporter
        const transporter = transport.transporter;

        let firstInput = false;

        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                node.error(error);
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: "connection failed",
                });
                return;
            }

            if (!firstInput) {
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: "connected",
                });
            }
        });

        node.sendEmail = async (msg, send, done) => {
            firstInput = true;

            // set node status
            node.status({
                fill: "blue",
                shape: "dot",
                text: `success ${counter.success}, error ${counter.error}`,
            });

            const m = msg.email || {};
            const mail = {
                from: m.from || config.from,
                to: m.to || config.to,
                cc: m.cc || config.cc,
                bcc: m.bcc || config.bcc,
                subject:
                    m.subject ||
                    config.subject ||
                    msg.topic ||
                    "Message from Node-RED",
                attachments: m.attachments,
                text: m.text,
                html: m.html,
                amp: m.amp,
            };

            if (config.contentType === "html") {
                mail.html = msg.payload;
            } else if (config.contentType === "amp") {
                mail.amp = msg.payload;
            } else {
                // plain text message
                // nodemailer is expecting a Unicode string, Buffer, Stream or an attachment-like object
                if (
                    typeof msg.payload === "number" ||
                    typeof msg.payload === "boolean"
                ) {
                    mail.text = String(msg.payload);
                } else {
                    mail.text = msg.payload;
                }
            }

            transporter
                .sendMail(mail)
                .then((info) => {
                    delete msg.email;
                    msg.payload = info;

                    // increase success count
                    counter.success++;
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: `success ${counter.success}, error ${counter.error}`,
                    });

                    send(msg);
                    done();
                })
                .catch((err) => {
                    counter.error++;
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: `success ${counter.success}, error ${counter.error}`,
                    });
                    done(err);
                });
        };

        node.on("input", node.sendEmail);
    }

    RED.nodes.registerType("email-send", EmailSend);
};
