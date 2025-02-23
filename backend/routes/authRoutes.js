// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const router = express.Router();
require('dotenv').config();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, phone, assessment, password, role } = req.body;
  try {
    // Check for existing user by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // For an EXPERT signup, you might skip 'assessment' or do any other logic
    const newUser = new User({
      name,
      email,
      phone,
      assessment: role === "EXPERT" ? "" : assessment,
      password: hashedPassword,
      role: role || "GENERAL",
      isVerified: false, // Unverified by default
    });

    await newUser.save();

    // Generate a verification token valid for 24 hours
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    const verificationLink = `${process.env.FRONTEND_URL}/email-verification?token=${token}`;

    // HTML content for the email
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333333; text-align: center;">Email Verification</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">Thank you for registering with us. To complete your registration, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px; cursor: pointer;">
                Verify Email
              </a>
            </div>

            <p style="color: #555555; font-size: 16px; line-height: 1.6;">If you did not create an account with us, please ignore this email.</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">This link is valid for 24 hours. After that, you will need to request a new verification email.</p>
            
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">Thank you,</p>
            <p style="color: #555555; font-size: 16px; line-height: 1.6;">The ${process.env.APP_NAME || "App"} Team</p>
          </div>
        </body>
      </html>
    `;

    // Send verification email
    await sendMail({
      to: email,
      subject: "Verify Your Email",
      html: htmlContent, // Use HTML content instead of plain text
    });

    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      role: newUser.role,
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // 2) Check if email is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({
          error: "Email not verified. Please verify your email before logging in.",
        });
    }

    // 3) Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // 4) Generate JWT (24h)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 5) Now we add isSuperAdmin + permissions to the response
    //    (assuming your User model has these fields)
    const userResponse = {
      message: "Login successful.",
      token,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin || false,
      permissions: user.permissions || [],
      // any other fields you want your front-end to store
    };

    // 6) Respond with all required data
    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
