import nodemailer from 'nodemailer';

const EMAIL_FROM = process.env.EMAIL_FROM || 'ExpenseTracker <no-reply@expensetracker.local>';

const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  // Dev fallback: log the email to the console instead of sending it.
  return {
    sendMail: async (options) => {
      console.log('===== DEV EMAIL (SMTP not configured, not really sent) =====');
      console.log(`From:    ${options.from}`);
      console.log(`To:      ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(options.text);
      console.log('============================================================');
      return { accepted: [options.to], rejected: [], devMode: true };
    },
  };
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  return transporter.sendMail({ from: EMAIL_FROM, to, subject, text, html });
};

export default sendEmail;
