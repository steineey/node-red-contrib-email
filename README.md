# node-red-contrib-email

SMTP email node for Node-RED

## Installation 

You can install by using the *Menu - Manage Palette* option, or running the following command in your Node-RED user directory - typically ~/.node-red

```sh
cd ~/.node-red
npm install --save node-red-contrib-email
```

## Requirements

NodeJS version >= 6.0.0 \
Node-RED >= 2.0.0

## SMTP (Transport) Config Node

-   **host** - is the hostname or ip address to connect to
-   **port** - is the port to connect to
-   **secure** – if true the connection will use TLS when connecting to server. If false (the default) then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
-   **auth** - authentication 'none' or 'login'

## Send Mail Node Input

-   **from** - The email address of the sender. All email addresses can be plain ‘sender@server.com’ or formatted '“Sender Name” sender@server.com', see Address object for details
-   **to** - Comma separated list or an array of recipients email addresses that will appear on the To: field
-   **cc** - Comma separated list or an array of recipients email addresses that will appear on the Cc: field
-   **bcc** - Comma separated list or an array of recipients email addresses that will appear on the Bcc: field
-   **subject** - The subject of the email
-   **text** - The plaintext version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: ‘/var/data/…'})
-   **html** - The HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: ‘http://…'})
-   **attachments** - An array of attachment objects (see [Using attachments](https://nodemailer.com/message/attachments/) for details). Attachments can be used for embedding images as well.

`msg.payload` will used as mail.text or mail.html, depending on `content-type` field is set to text, html or amp.

Use the node form to define the fields or let the form fields empty and use `msg.email` instead:

```js
msg.email = {
    from: "foo@example.com",
    to: "bar@example.com",
    subject: "Test",
    text: "This is my mail",
    attachments: [
        {
            // utf-8 string as an attachment
            filename: "text1.txt",
            content: "hello world!",
        },
        {
            // binary buffer as an attachment
            filename: "text2.txt",
            content: new Buffer("hello world!", "utf-8"),
        },
        {
            // file on disk as an attachment
            filename: "text3.txt",
            path: "/path/to/file.txt", // stream this file
        },
        {
            // filename and content type is derived from path
            path: "/path/to/file.txt",
        },
        {
            // stream as an attachment
            filename: "text4.txt",
            content: fs.createReadStream("file.txt"),
        },
        {
            // define custom content type for the attachment
            filename: "text.bin",
            content: "hello world!",
            contentType: "text/plain",
        },
        {
            // use URL as an attachment
            filename: "license.txt",
            path: "https://raw.github.com/nodemailer/nodemailer/master/LICENSE",
        },
        {
            // encoded string as an attachment
            filename: "text1.txt",
            content: "aGVsbG8gd29ybGQh",
            encoding: "base64",
        },
        {
            // data uri as an attachment
            path: "data:text/plain;base64,aGVsbG8gd29ybGQ=",
        },
        {
            // use pregenerated MIME node
            raw:
                "Content-Type: text/plain\r\n" +
                "Content-Disposition: attachment;\r\n" +
                "\r\n" +
                "Hello world!",
        },
    ],
};
```

example for amp message

```js
msg.email = {
    from: "Nodemailer <example@nodemailer.com>",
    to: "Nodemailer <example@nodemailer.com>",
    subject: "AMP4EMAIL message",
    text: "For clients with plaintext support only",
    html: "<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>",
    amp: `<!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
        <style amp4email-boilerplate>body{visibility:hidden}</style>
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
      </head>
      <body>
        <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
        <p>GIF (requires "amp-anim" script in header):<br/>
          <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
      </body>
    </html>`,
};
```

## Send Mail Node Output

output `msg.payload` includes the result, the exact format depends on the transport mechanism used

-   `msg.payload.messageId` - most transports should return the final Message-Id value used with this property
-   `msg.payload.envelope` includes the envelope object for the message
-   `msg.payload.accepted` is an array returned by SMTP transports (includes recipient addresses that were accepted by the server)
-   `msg.payload.rejected` is an array returned by SMTP transports (includes recipient addresses that were rejected by the server)
-   `msg.payload.pending` is an array returned by Direct SMTP transport. Includes recipient addresses that were temporarily rejected together with the server response
    response is a string returned by SMTP transports and includes the last SMTP response from the server

## Connection Test

SMTP connection is verified at node startup and displayed as node status.
Be aware though that this call only tests connection and authentication but it does not check if the service allows you to use a specific envelope From address or not.