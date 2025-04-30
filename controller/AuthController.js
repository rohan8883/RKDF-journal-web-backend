import Users from '../models/user.model.js';
import { compare, generateToken, hash, verifyToken } from '../utils/index.js';
import { forgetPasswordMailer } from '../utils/nodemailer/forgetPasswordMailer.js';

// 0.Login with cookies and credentials
export async function LoginWithCookie(req, res) {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email, status: 1 });
    if (!user) return res.status(404).send({ message: 'user not found' });

    const validPass = await compare(String(password), String(user.password));
    if (!validPass)
      return res.status(400).json({
        success: false,
        message: 'Invalid Credentials'
      });

    const token = generateToken({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    });
    return res
      .cookie('token', token, {
        // expires: new Date(Date.now() + 900000),
        maxAge: 3600, // one hour
        httpOnly: true,
        // secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/'
      })
      .send({ token: token, message: 'Successfully login' });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

// 1.Login
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email, status: 1 });
    if (!user)
      return res.status(200).send({ status: false, message: 'user not found' });

    const validPass = await compare(String(password), String(user.password));
    if (!validPass)
      return res.status(200).json({
        success: false,
        message: 'Invalid Credentials'
      });

    const token = generateToken({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      roleId: user.roleId,
      ulbId: user.ulbId
    });
    return res.header('Authorization', `Bearer ${token}`).json({
      message: 'Login successful',
      token: token,
      success: true,
      userDetails: {
        id: user._id,
        role: user.role,
        email: user.email,
        ulbId: user.ulbId
      }
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
}

// 2.Register

export async function Register(req, res) {
  const { fullName, email, mobile, roleId, password } = req.body;

  const emailExist = await Users.findOne({ email });
  if (emailExist)
    return res.status(302).json({ message: 'Already registered' });
  //cerate new user

  const hashPassword = await hash(String(password));
  const user = new Users({
    fullName,
    email,
    mobile,
    roleId,

    password: hashPassword
  });
  try {
    await user.save();
    res.send({ _id: user._id, message: 'user created successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
}

// /forgotPassword
export async function ForgotPassword(req, res) {
  const { email } = req.body;
  try {
    const oldUser = await Users.findOne({ email });
    if (!oldUser) {
      return res.status(401).json({ message: 'User Not Exists!!' });
    }

    const token = generateToken(
      {
        email: oldUser.email,
        _id: oldUser._id
      },
      oldUser.password
    );

    const resMail = await forgetPasswordMailer({
      to: oldUser.email,
      subject: 'Password Reset',
      // text: `https://jobindia-new-client.vercel.app/auth/resetpassword?id=${oldUser._id}&token=${token}`,
      text: `http://localhost:5173/grievance/auth/citizen-reset-password?id=${oldUser._id}&token=${token}`,
      // html: `<p>https://jobindia-new-client.vercel.app/auth/resetpassword?id=${oldUser._id}&token=${token}</p>`
      html: `<p>http://localhost:5173/grievance/auth/citizen-reset-password?id=${oldUser._id}&token=${token}</p>`
    });

    return res.status(200).json({
      success: true,
      message: 'Change password requested successfully sended in your mail'
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

// 4.Reset password
export async function ResetPassword(req, res) {
  const { id, token, password } = req.body;

  const oldUser = await Users.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ success: false, status: 'User Not Exists!!' });
  }
  try {
    verifyToken(token, oldUser?.password);
    const encryptedPassword = await hash(password);
    await Users.updateOne(
      {
        _id: id
      },
      {
        $set: {
          password: encryptedPassword
        }
      }
    );
    return res.status(200).json({
      success: true,
      message: 'Password Updated!!'
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}
