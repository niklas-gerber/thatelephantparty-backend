const nodemailer = require('nodemailer');
const logger = require('./logger');

// MAILSERVICE FOR AUTOMATED EMAIL on purchase 

// SMTP transporter (reusable for all emails)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports (TLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  }
});

/**
 * Send ticket confirmation email (HTML formatted)
 * @param {string} buyerEmail 
 * @param {string} buyerName 
 * @param {string} eventTitle 
 * @param {string} emailContent (HTML from Event model)
 */
const sendTicketConfirmation = async (buyerEmail, buyerName, eventTitle, emailContent) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to: buyerEmail,
      subject: `Your Ticket for ${eventTitle}`, // Dynamic subject
      html: `
        <p>Hey ${buyerName},</p>
        ${emailContent} <!-- Raw HTML from Event.email_template_content -->
        <p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${buyerEmail}`);
  } catch (error) {
    logger.error(`Email failed to ${buyerEmail}: ${error.message}`);
    // No retry (per your requirements)
  }
};

module.exports = { sendTicketConfirmation };