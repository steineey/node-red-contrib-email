# node-red-contrib-email

SMTP email node for Node-RED

[![npm version](https://img.shields.io/npm/v/node-red-contrib-email.svg?style=flat-square)](https://www.npmjs.org/package/node-red-contrib-email)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=node-red-contrib-email&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=node-red-contrib-email)
[![npm downloads](https://img.shields.io/npm/dm/node-red-contrib-email.svg?style=flat-square)](https://npm-stat.com/charts.html?package=node-red-contrib-email)

![node-email-send](https://raw.githubusercontent.com/steineey/node-red-contrib-email/master/examples/node-email-send.png)

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
-   **proxy** - is a proxy URL, for example 'http://proxy-host:1234'

## Send Mail Node Input

-   **from** - The email address of the sender. All email addresses can be plain ‘sender@server.com’ or formatted '“Sender Name” sender@server.com', see Address object for details. Can be overwritten with `msg.email.from`.
-   **to** - Comma separated list or an array of recipients email addresses that will appear on the To: field. Can be overwritten with `msg.email.to`.
-   **cc** - Comma separated list or an array of recipients email addresses that will appear on the Cc: field. Can be overwritten with `msg.email.cc`.
-   **bcc** - Comma separated list or an array of recipients email addresses that will appear on the Bcc: field. Can be overwritten with `msg.email.bcc`.
-   **subject** - The subject of the email. Can be overwritten with `msg.email.subject`.
-   **priority** -  Sets message importance headers, either ‘high’, ‘normal’ (default) or ‘low’. Can be overwritten with `msg.email.priority`.

### Message Payload

`msg.payload` can be used for one of the following message versions. Set the node property **payload type** to set the version of your `msg.payload`.

-   **text** - The plaintext version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: ‘/var/data/…'}). If you're sending a `msg.payload` of type number or boolean, then it is converted to string.
-   **html** - The HTML version of the message as an Unicode string, Buffer, Stream or an attachment-like object ({path: ‘http://…'})
-   **amp** - AMP4EMAIL specific HTML version of the message, same usage as with text and html. See AMP example below for usage or this [blogpost](https://blog.nodemailer.com/2019/12/30/testing-amp4email-with-nodemailer/) for sending and rendering.

### Attachments

Set `msg.email.attachments` as an array of attachment objects (see [Using attachments](https://nodemailer.com/message/attachments/) for details). Attachments can be used for embedding images as well.

```js
msg.email = {
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

### Overwrite Node Properties

Use the node editor to define the email fields or overwrite this properties with a flow msg:

```js
msg.email = {
    from: "foo@example.com",
    to: "bar@example.com",
    subject: "Test",
    text: "This is the plain text version.",
    html: "<h1>This is the html version</h1>",
    attachments: [
        {
            // utf-8 string as an attachment
            filename: "text1.txt",
            content: "hello world!",
        }
    ],
};
```

Only overwrite email.to:
```js
msg.email = {
    to: "receiver@example.com"
};
```

Example for amp message:

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

## More Information

This node is based on *nodemailer*. Read their documentation for a deeper understanding:

- [smtp configuration](https://nodemailer.com/smtp/)
- [message configuration](https://nodemailer.com/message/)

## Feature Requests

Feel free to contact me for any feature request.

Features not implemented yet:

- OAuth2 authentication
- Pooled SMTP
- Delivery status notification
- Calendar events

