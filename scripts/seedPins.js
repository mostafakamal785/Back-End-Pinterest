import mongoose from 'mongoose';
import User from '../models/users.model.js';
import Pin from '../models/pin.model.js';
import Board from '../models/board.model.js';

const MONGODB_URI = 'mongodb://localhost:27017/pinterest';

const seedPins = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find existing users
    const users = await User.find({});
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const testUser = users[0]; // Use first user
    console.log(`📌 Using user: ${testUser.name} (${testUser.email})`);

    // Create a test board
    const testBoard = await Board.create({
      name: 'Test Board',
      description: 'A board for testing pins',
      owner: testUser._id,
      privacy: 'public'
    });

    console.log('📌 Created test board');

    // Create sample pins
    const samplePins = [
      {
        title: 'Beautiful Sunset',
        description: 'A stunning sunset over the mountains',
        media: {
          uri: 'https://picsum.photos/400/600?random=1',
          filename: 'sunset.jpg',
          type: 'image'
        },
        owner: testUser._id,
        board: testBoard._id,
        keywords: ['sunset', 'nature', 'mountains'],
      },
      {
        title: 'Delicious Pizza',
        description: 'Homemade pizza with fresh ingredients',
        media: {
          uri: 'https://picsum.photos/400/600?random=2',
          filename: 'pizza.jpg',
          type: 'image'
        },
        owner: testUser._id,
        board: null, // No board
        keywords: ['food', 'pizza', 'cooking'],
      },
      {
        title: 'Modern Architecture',
        description: 'Contemporary building design',
        media: {
          uri: 'https://picsum.photos/400/600?random=3',
          filename: 'architecture.jpg',
          type: 'image'
        },
        owner: testUser._id,
        board: testBoard._id,
        keywords: ['architecture', 'modern', 'design'],
      },
      {
        title: 'Coffee Time',
        description: 'Perfect cup of coffee',
        media: {
          uri: 'https://picsum.photos/400/600?random=4',
          filename: 'coffee.jpg',
          type: 'image'
        },
        owner: testUser._id,
        board: null,
        keywords: ['coffee', 'drink', 'morning'],
      }
    ];

    const createdPins = await Pin.insertMany(samplePins);
    console.log(`✅ Created ${createdPins.length} sample pins`);

    // Update board with pins
    await Board.findByIdAndUpdate(testBoard._id, {
      $push: { pins: { $each: createdPins.filter(p => p.board).map(p => p._id) } }
    });

    console.log('✅ Updated board with pins');
    console.log('🎉 Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pins:', error);
    process.exit(1);
  }
};

seedPins();
