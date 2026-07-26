require('dotenv').config();

const { connectToDatabase, closeDatabaseConnection } = require('../config/database');
const User = require('../models/User');

/**
 * Seed users into MongoDB
 * Inserts only if users do not already exist
 */
async function seedUsers() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Check if users already exist
    const existingUserCount = await User.countDocuments();
    if (existingUserCount > 0) {
      console.log(`✓ ${existingUserCount} users already exist. Skipping seed.`);
      return;
    }

    // Generate realistic Indian users
    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        address: {
          street: '123, MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+91 98765 43211',
        address: {
          street: '456, Anna Salai',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600002',
          country: 'India'
        }
      },
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phone: '+91 98765 43212',
        address: {
          street: '789, Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India'
        }
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '+91 98765 43213',
        address: {
          street: '321, Park Street',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700016',
          country: 'India'
        }
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98765 43214',
        address: {
          street: '654, Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400021',
          country: 'India'
        }
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '+91 98765 43215',
        address: {
          street: '987, Ashram Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380009',
          country: 'India'
        }
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: '+91 98765 43216',
        address: {
          street: '147, Banjara Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500034',
          country: 'India'
        }
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 98765 43217',
        address: {
          street: '258, Civil Lines',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302006',
          country: 'India'
        }
      }
    ];

    // Add timestamps
    const now = new Date();
    users.forEach(user => {
      user.created_at = now;
      user.updated_at = now;
    });

    // Insert users
    console.log('✓ Inserting Users...');
    const insertedUsers = await User.insertMany(users);
    console.log(`✓ Inserted ${insertedUsers.length} Users`);
    console.log('✓ Database Seed Complete');

  } catch (error) {
    console.error('✗ Error during seed:', error.message);
    
    // Handle specific error types
    if (error.code === 11000) {
      console.error('✗ Duplicate key error - Email must be unique');
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    await closeDatabaseConnection();
  }
}

// Run the seed script
seedUsers();
