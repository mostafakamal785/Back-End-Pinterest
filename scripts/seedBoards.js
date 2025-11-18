import mongoose from 'mongoose';
import User from '../models/users.model.js';
import Board from '../models/board.model.js';

const MONGODB_URI = 'mongodb://localhost:27017/pinterest';

const seedBoards = async () => {
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

    // Create sample boards
    const sampleBoards = [
      {
        name: 'Travel Adventures',
        description: 'Beautiful destinations and travel inspiration from around the world',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['travel', 'vacation', 'adventure', 'nature', 'photography'],
      },
      {
        name: 'Delicious Food',
        description: 'Amazing recipes and mouth-watering dishes to try at home',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['food', 'recipes', 'cooking', 'delicious', 'yum'],
      },
      {
        name: 'Modern Architecture',
        description: 'Stunning contemporary buildings and architectural designs',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['architecture', 'modern', 'design', 'buildings', 'urban'],
      },
      {
        name: 'Art & Creativity',
        description: 'Inspiring artwork and creative expressions from talented artists',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['art', 'creativity', 'painting', 'design', 'inspiration'],
      },
      {
        name: 'Fashion Trends',
        description: 'Latest fashion trends and stylish outfits',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['fashion', 'style', 'trends', 'outfits', 'clothing'],
      },
      {
        name: 'Home Decor',
        description: 'Beautiful home decoration ideas and interior design inspiration',
        owner: testUser._id,
        privacy: 'public',
        keywords: ['home', 'decor', 'interior', 'design', 'cozy'],
      }
    ];

    const createdBoards = await Board.insertMany(sampleBoards);
    console.log(`✅ Created ${createdBoards.length} sample boards`);

    console.log('🎉 Boards seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding boards:', error);
    process.exit(1);
  }
};

seedBoards();
