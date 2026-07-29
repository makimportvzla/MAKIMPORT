import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'makimportvzla@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
