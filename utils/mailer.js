import nodeMailer from 'nodemailer';

export async function mailer({ to, text, subject, html }) {
  const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD
    }
  });

  let info = await transporter.sendMail({
    from: 'mernstack38@gmail.com', // sender address
    to, // list of receivers
    subject, // Subject line
    text, // plain text body
    html // html body
  });
  return info;
}
