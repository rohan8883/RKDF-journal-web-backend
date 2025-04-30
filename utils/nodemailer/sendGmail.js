import nodemailer from 'nodemailer'
import { complaintRegister } from './template/complaintRegister.js';
import { complaintRejection } from './template/complaintRejection.js';
import { complaintResolution } from './template/complaintResolution.js';
import { complaintClosing } from './template/complaintClosing.js';

// ════════════════════║ NODEMAILER SETUP  ║═════════════════════════
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL_ID || 'imonn439@gmail.com',
		pass: process.env.GMAIL_APP_PASSWORD || 'zcrt gfky vvsr omwy',
	},
});

// ════════════════════║ 1 THIS FUNCTION SENDS COMPLAINT REGISRATION GMAIL  ║═════════════════════════
export const sendGmailComplaintRegistration = async ({ title, complaintNo, citizenName, ulbName, moduleName, citizenEmail }) => {
	const mailOptions = {
		from: process.env.GMAIL_ID || "imonn439@gmail.com",
		to: citizenEmail,
		subject: "Complaint Registered Successfully",
		text: "Complaint Registration Notification",
		html: complaintRegister({ title, complaintNo, citizenName, ulbName, moduleName }),
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email to :", citizenEmail);
		} else {
			console.log("Email sent to :", citizenEmail);
		}
	});
};

// ════════════════════║ 2 THIS FUNCTION SENDS COMPLAINT REJECTION GMAIL  ║═════════════════════════
export const sendGmailComplaintRejection = async ({ title, complaintNo, citizenName, ulbName, moduleName, citizenEmail }) => {
	const mailOptions = {
		from: process.env.GMAIL_ID || "imonn439@gmail.com",
		to: citizenEmail,
		subject: "Complaint Rejected",
		text: "Complaint Rejection Notification",
		html: complaintRejection({ title, complaintNo, citizenName, ulbName, moduleName }),
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email to :", citizenEmail);
		} else {
			console.log("Email sent to :", citizenEmail);
		}
	});
};

// ════════════════════║ 3 THIS FUNCTION SENDS COMPLAINT RESOLUTION GMAIL  ║═════════════════════════
export const sendGmailComplaintResolution = async ({ title, complaintNo, citizenName, ulbName, moduleName, citizenEmail }) => {
	const mailOptions = {
		from: process.env.GMAIL_ID || "imonn439@gmail.com",
		to: citizenEmail,
		subject: "Complaint Resolved Successfully",
		text: "Complaint Resolution Notification",
		html: complaintResolution({ title, complaintNo, citizenName, ulbName, moduleName }),
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email to :", citizenEmail);
		} else {
			console.log("Email sent to :", citizenEmail);
		}
	});
};

// ════════════════════║ 4 THIS FUNCTION SENDS COMPLAINT CLOSING GMAIL  ║═════════════════════════
export const sendGmailComplaintClosing = async ({ title, complaintNo, citizenName, ulbName, moduleName, citizenEmail }) => {
	const mailOptions = {
		from: process.env.GMAIL_ID || "imonn439@gmail.com",
		to: citizenEmail,
		subject: "Complaint Closed",
		text: "Complaint Closing Notification",
		html: complaintClosing({ title, complaintNo, citizenName, ulbName, moduleName }),
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email to :", citizenEmail);
		} else {
			console.log("Email sent to :", citizenEmail);
		}
	});
};
