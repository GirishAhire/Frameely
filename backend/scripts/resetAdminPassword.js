import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@frameely.com' });
    if (!adminUser) {
      console.log('Admin user not found. Creating new admin user...');
      
      const newAdmin = new User({
        name: 'Admin',
        email: 'admin@frameely.com',
        password: 'admin123', // Will be hashed by the pre-save hook
        isAdmin: true
      });
      
      await newAdmin.save();
      console.log('New admin user created successfully');
    } else {
      console.log('Found existing admin user. Resetting password...');
      
      adminUser.password = 'admin123'; // Will be hashed by the pre-save hook
      await adminUser.save();
      
      console.log('Admin password reset successfully');
    }

    // Verify the password
    const updatedAdmin = await User.findOne({ email: 'admin@frameely.com' });
    const isMatch = await updatedAdmin.comparePassword('admin123');
    console.log('Password verification:', isMatch ? 'Success' : 'Failed');
    console.log('Admin user details:', {
      id: updatedAdmin._id,
      email: updatedAdmin.email,
      isAdmin: updatedAdmin.isAdmin,
      passwordHash: updatedAdmin.password
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetAdminPassword(); 