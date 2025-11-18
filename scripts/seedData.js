import mongoose from 'mongoose';
import Board from '../models/board.model.js';
import Pin from '../models/pin.model.js';

const MONGODB_URI = 'mongodb://localhost:27017/pinterest-clone';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Board.deleteMany({});
    await Pin.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create test user (you'll need to adjust based on your auth)
    const testUser = await User.findOne({ username: 'testuser' });
    if (!testUser) {
      console.log('❌ Please create a test user first');
      return;
    }

    // Create sample boards
    const boards = await Board.create([
      {
        name: 'Home Decor Ideas',
        description: 'Beautiful home decoration inspiration',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['decor', 'home', 'interior'],
      },
      {
        name: 'Delicious Recipes',
        description: 'Amazing food recipes to try',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['food', 'recipes', 'cooking'],
      },
      {
        name: 'Private Travel Plans',
        description: 'My personal travel bucket list',
        owner: testUser._id,
        privacy: 'private',
        keywords: ['travel', 'vacation'],
      },
    ]);

    // Create sample pins
    const pins = await Pin.create([
      {
        title: 'Modern Living Room',
        description: 'Beautiful modern living room design',
        owner: testUser._id,
        board: boards[0]._id,
        media: {
          uri: 'https://example.com/image1.jpg',
          filename: 'living-room.jpg',
          type: 'image',
        },
        keywords: ['livingroom', 'modern', 'design'],
      },
      {
        title: 'Chocolate Cake Recipe',
        description: 'Delicious chocolate cake recipe',
        owner: testUser._id,
        board: boards[1]._id,
        media: {
          uri: 'https://example.com/image2.jpg',
          filename: 'chocolate-cake.jpg',
          type: 'image',
        },
        keywords: ['cake', 'chocolate', 'dessert'],
      },
    ]);

    // Add pins to boards
    await Board.findByIdAndUpdate(boards[0]._id, { $push: { pins: pins[0]._id } });
    await Board.findByIdAndUpdate(boards[1]._id, { $push: { pins: pins[1]._id } });

    console.log('✅ Test data created successfully!');
    console.log(`📌 Created ${boards.length} boards and ${pins.length} pins`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
