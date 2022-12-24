const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.from = `Socio <${process.env.Email}>`;
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Since my sendgrid account is not verified, Email is not sent
      //   return nodemailer.createTransport({
      //     service: 'SendGrid',
      //     auth: {
      //       // You can find this in your SendGrid account
      //       // Remember to add this to your .env file, i haven't done it yet because I don't have a sendgrid account
      //       user: process.env.SENDGRID_USERNAME,
      //       pass: process.env.SENDGRID_PASSWORD,
      //     },
      //   });
      // }

      // using gmail instead
      return nodemailer.createTransport({
        service: "Gmail",
        auth: {
          // You can find this in your SendGrid account
          // Remember to add this to your .env file, i haven't done it yet because I don't have a sendgrid account
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    }

    // Mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  sendWelcome() {
    this.send("welcome", "Welcome to the Socio Family!");
  }

  sendPasswordReset() {
    this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  sendConfirmEmail() {
    this.send("confirmEmail", "Confirm your email address");
  }
};
