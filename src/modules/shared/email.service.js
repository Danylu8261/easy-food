const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Função genérica para envio de e-mails
 * Recebe: to, subject, header, body e footer
 */
async function sendEmail({ to, subject, header, body, footer }) {
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h1 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${header}</h1>
      <div style="font-size: 16px; line-height: 1.6; color: #2d3748; margin: 20px 0;">
        ${body}
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <footer style="font-size: 12px; color: #718096; text-align: center; margin-top: 10px;">
        ${footer}
      </footer>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html: htmlTemplate,
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };