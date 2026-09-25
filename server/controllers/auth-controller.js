const User = require('../models/user');
const generateToken = require('../utils/generate-token');
const crypto = require('crypto');
const sendEmail = require('../utils/send-email');

const otpStorage = {};
const passwordResetStorage = {};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.defaultAddress) {
        if (!user.defaultAddress) {
          user.defaultAddress = {};
        }
        user.defaultAddress.address = req.body.defaultAddress.address;
        user.defaultAddress.city = req.body.defaultAddress.city;
        user.defaultAddress.postalCode = req.body.defaultAddress.postalCode;
        user.defaultAddress.country = req.body.defaultAddress.country;
        user.markModified('defaultAddress');
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        defaultAddress: updatedUser.defaultAddress,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
};
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user' });
  }
};
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user' });
  }
};
const generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('[Forgot Password] Request received');
    const user = await User.findOne({ email });
    console.log('[Forgot Password] User lookup completed');

    if (!user) {
      return res.status(200).json({ message: 'If that email is registered, an OTP was sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('[Forgot Password] OTP generated');

    otpStorage[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hello,</h2>
        <p>We received a request to reset your SoftraTees password.</p>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes. Do not share the OTP with anyone.</p>
        <p>If you did not request this password reset, you can safely ignore this email.</p>
      </div>
    `;

    try {
      console.log('[Forgot Password] Sending OTP email');
      await sendEmail({
        email: user.email,
        subject: 'SoftraTees Password Reset OTP',
        html: htmlContent,
      });
      console.log('[Forgot Password] OTP email sent successfully');
      res.status(200).json({ message: 'If that email is registered, an OTP was sent.' });
    } catch (err) {
      console.error('[Forgot Password] Email sending failed:', err.message);
      delete otpStorage[email];
      
      if (err.message.includes('configuration error')) {
        return res.status(500).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
    }
  } catch (error) {
    console.error('[Forgot Password] Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!otpStorage[email]) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (Date.now() > otpStorage[email].expiresAt) {
      delete otpStorage[email];
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    if (otpStorage[email].otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    delete otpStorage[email];
    console.log('[Forgot Password] OTP verification successful');

    passwordResetStorage[email] = {
      verified: true,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('[Forgot Password] Verify OTP Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!passwordResetStorage[email] || !passwordResetStorage[email].verified) {
      return res.status(400).json({ message: 'Unauthorized. Please verify OTP first.' });
    }

    if (Date.now() > passwordResetStorage[email].expiresAt) {
      delete passwordResetStorage[email];
      return res.status(400).json({ message: 'Session expired. Please start over.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    delete passwordResetStorage[email];
    console.log('[Forgot Password] Password reset successful');

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('[Forgot Password] Reset Password Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  generateOtp,
  verifyOtp,
  resetPassword,
};
