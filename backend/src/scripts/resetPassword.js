#!/usr/bin/env node
// CLI password reset: node src/scripts/resetPassword.js <email> <newPassword>
// Example: npm run reset-password -- test@example.com newSecret123
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
  console.error('Usage: node src/scripts/resetPassword.js <email> <newPassword>');
  console.error('Example: npm run reset-password -- test@example.com newSecret123');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('Error: password must be at least 6 characters.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`Error: no user found with email "${email}".`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.password = newPassword; // hashed by the User model pre-save hook
  await user.save();

  console.log(`Password for ${user.email} has been reset successfully.`);
  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error('Failed to reset password:', error.message);
  process.exit(1);
}
