const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register new user & Send OTP
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please add all fields');
      }

      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
            if (user.isVerified) {
                  res.status(400);
                  throw new Error('User already exists');
            }
            // If user exists but NOT verified, we will update the OTP and resend
            // We can also update name/password if needed, but for now let's just update OTP

            // Hash password if a new one was provided, otherwise keep old? 
            // Better to update with new details in case they made a typo before
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user.name = name;
            user.password = hashedPassword;
      } else {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user (Unverified)
            user = new User({
                  name,
                  email,
                  password: hashedPassword,
                  isVerified: false
            });
      }

      // Generate (or regenerate) OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      if (user) {
            // Send OTP Email
            const message = `Your Email Verification OTP is: ${otp}. It expires in 10 minutes.`;
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
                  <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #4F46E5; margin-bottom: 5px;">ExpenseML</h1>
                        <p style="color: #666; font-size: 14px; margin-top: 0;">Smart Finance Management</p>
                  </div>
                  
                  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
                        <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for registering with ExpenseML. Please use the OTP below to verify your email address. This OTP is valid for 10 minutes.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background-color: #EEF2FF; padding: 10px 20px; border-radius: 5px;">${otp}</span>
                        </div>
                        
                        <p style="color: #555; font-size: 16px; line-height: 1.5;">If you did not request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 14px; text-align: center;">Thanks for using ExpenseML!</p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p style="margin-bottom: 10px;">This is an automated message, please do not reply.</p>
                        <p>Developed with ❤️ by <strong>Bharat Dixit</strong></p>
                        <p>&copy; ${new Date().getFullYear()} ExpenseML. All rights reserved.</p>
                  </div>
            </div>
            `;

            try {
                  await sendEmail({
                        email: user.email,
                        subject: 'ExpenseML Email Verification',
                        message,
                        html
                  });

                  res.status(201).json({
                        _id: user.id,
                        name: user.name,
                        email: user.email,
                        message: `OTP sent to ${user.email}. Please verify to login.`
                  });
            } catch (error) {
                  console.error("Email send failed:", error);
                  // Optional: Delete user if email fails? Or let them retry?
                  // For now, let's keep user but they can't login without OTP.
                  // Maybe expose an endpoint to resend OTP.
                  res.status(500);
                  throw new Error('Email sending failed. Please try again.');
            }
      } else {
            res.status(400);
            throw new Error('Invalid user data');
      }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
      const { email, password } = req.body;

      // Check for user email
      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                  res.status(401);
                  throw new Error('Email not verified. Please verify your email.');
            }

            res.json({
                  _id: user.id,
                  name: user.name,
                  email: user.email,
                  token: generateToken(user._id),
            });
      } else {
            res.status(400);
            throw new Error('Invalid credentials');
      }
});

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
            res.status(400);
            throw new Error('Please provide email and OTP');
      }

      const user = await User.findOne({ email });

      if (!user) {
            res.status(400);
            throw new Error('User not found');
      }

      if (user.isVerified) {
            res.status(400);
            throw new Error('User already verified. Please login.');
      }

      if (user.otp === otp && user.otpExpires > Date.now()) {
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            res.status(200).json({
                  _id: user.id,
                  name: user.name,
                  email: user.email,
                  token: generateToken(user._id),
                  message: 'Email verified successfully'
            });
      } else {
            res.status(400);
            throw new Error('Invalid or expired OTP');
      }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
      res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
      });
};

module.exports = {
      registerUser,
      loginUser,
      getMe,
      verifyEmail
};
