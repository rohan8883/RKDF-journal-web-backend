import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  keyGenerator(req) {
    return req.body.email;
  },
  windowMs: 2 * 60 * 1000, // 1 min window
  max: 2, // start blocking after 4 requests
  message: {
    message: 'Too many requests for OTP, please try again after some time.'
  }
});

export { rateLimiter };
