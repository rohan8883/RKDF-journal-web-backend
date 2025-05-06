import nodemailer from 'nodemailer'
import { otpTemplate } from './template/otpTemplate.js';

// ════════════════════║ NODEMAILER SETUP  ║═════════════════════════
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_ID || 'rohansingh9135@gmail.com',
		pass: process.env.GMAIL_APP_PASSWORD || 'rgwaydktkdnjrbyn',
	},
});


export const sendGmailOtp = async ({
	email,
	otp

}) => {

	const mailOptions = {
		from: process.env.GMAIL_ID || "rohansingh9135@gmail.com",
		to: email,
		subject: "Verification Code",
		text: "OTP RKDF",
		html: otpTemplate({
			otp
		}),
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email:", error);
			// res.status(500).send("Error sending email");
		} else {
			console.log("Email sent:", info.response);
			// res.status(200).send("Email sent successfully");
		}
	});
};
