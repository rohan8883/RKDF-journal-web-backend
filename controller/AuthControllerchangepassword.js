import Users from '../models/user.model.js';
import { compare, generateToken, hash, verifyToken } from '../utils/index.js';

export async function changePassword(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

    const decoded = verifyToken(token);
    const user = await Users.findById(decoded._id);
    if (!user || user.status !== 1) return res.status(404).json({ message: 'User not found' });

    const validPass = await compare(String(currentPassword), String(user.password));
    if (!validPass) return res.status(200).json({
      success: false,
      message: 'Invalid current password'
    });

    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'New passwords do not match' });

    const hashedPassword = await hash(String(newPassword));
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
