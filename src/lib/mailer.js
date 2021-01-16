const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "49d38eb00b88a1",
      pass: "50ff30cfd900e2"
    }
  });

  module.exports = transport