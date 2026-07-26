require('dotenv').config();
const { connectToDatabase } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    await connectToDatabase();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase().trim() });
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists. Updating password...`);
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash(adminPassword, salt);
      existingAdmin.role = 'ADMIN';
      await existingAdmin.save();
      console.log('✓ Admin user password updated successfully');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      name: 'System Admin',
      email: adminEmail.toLowerCase().trim(),
      phone: '1234567890',
      password: hashedPassword,
      address: {
        street: 'Admin HQ',
        city: 'Admin City',
        state: 'Admin State',
        pincode: '000000',
        country: 'System'
      },
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date()
    });

    await newAdmin.save();
    console.log(`✓ Admin user created successfully with email: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
