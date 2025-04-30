import { sendGmailOtp } from '../utils/nodemailer/sendGmailOtp.js';
import OTPTable from '../models/otp.model.js';

// ════════════════════════════║ THIS FUNCTION SENDS THE OTP ║═════════════════════════════════ //
export const sendOtp = async (req, res) => {
  const { email } = req?.body;

  try {
    //  Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpSave = new OTPTable({ email, otp });
    await otpSave.save(); // Save the OTP record to the OTPTable
    await sendGmailOtp({ email, otp });
    return res.status(200).json({
      success: true,
      message: 'Otp sent to your gmail'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ════════════════════════════║ THIS FUNCTION VERIFIES THE OTP ║═════════════════════════════════
export async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }
  try {
    const record = await OTPTable.findOne({ email, otp });
    if (!record) {
      return res
        .status(200)
        .json({ success: false, message: 'Invalid OTP or email' });
    }
    await OTPTable.deleteOne({ email, otp });
    return res
      .status(200)
      .json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
}
