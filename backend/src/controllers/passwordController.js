import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  password: z.string().min(6),
});

// POST /api/v1/auth/forgot-password
// Always responds 200 so the endpoint cannot be used to enumerate registered emails.
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password/${resetToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: 'ExpenseTracker - Password Reset (valid 15 minutes)',
          text: [
            `Hi ${user.username},`,
            '',
            'You (or someone else) requested a password reset for your ExpenseTracker account.',
            '',
            `Reset your password: ${resetUrl}`,
            '',
            'This link is valid for 15 minutes and can be used only once.',
            'If you did not request this, you can safely ignore this email - your password will not change.',
          ].join('\n'),
          html: [
            `<p>Hi <strong>${user.username}</strong>,</p>`,
            '<p>You (or someone else) requested a password reset for your ExpenseTracker account.</p>',
            `<p><a href="${resetUrl}">Reset your password</a></p>`,
            `<p>Or paste this link into your browser:<br/>${resetUrl}</p>`,
            '<p>This link is valid for <strong>15 minutes</strong> and can be used only once.</p>',
            '<p>If you did not request this, you can safely ignore this email - your password will not change.</p>',
          ].join('\n'),
        });
      } catch (mailError) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(500).json({
          success: false,
          message: 'Email could not be sent. Try again later.',
        });
      }
    }

    res.json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = resetSchema.parse(req.body);

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires +password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired. Please request a new one.',
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
