import nodemailer from 'nodemailer'

export const forgetPasswordMailer = async ({
    to,
    text,
    subject,
    html
}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    let info = await transporter.sendMail({
        from: 'imonn439@gmail.com', // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html // html body
    });
    return info;

}