import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { JWT_SECRET, JWT_ALGORITHM } = process.env;

export const generateToken = (payload) => {
  try {
    return JWT.sign(payload, String(JWT_SECRET), {
      algorithm: 'HS256'
    });
  } catch (error) {
    throw new Error('Error generating token');
  }
};

export const verifyToken = (token) => {
  try {
    return JWT.verify(token, String(JWT_SECRET), {
      algorithms: ['HS256']
    });
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const hash = async (data) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(data, salt);
};

export const compare = async (data, hash) => {
  return bcrypt.compare(data, hash);
};
