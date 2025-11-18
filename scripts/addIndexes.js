import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pinterest';

async function addIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // User indexes
    const User = mongoose.model('User');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ "username": "text", "name": "text" });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('✅ User indexes created');

    // Pin indexes
    const Pin = mongoose.model('Pin');
    await Pin.collection.createIndex({ owner: 1, createdAt: -1 });
    await Pin.collection.createIndex({ board: 1 });
    await Pin.collection.createIndex({ "title": "text", "description": "text", "keywords": "text" });
    await Pin.collection.createIndex({ createdAt: -1 });
    await Pin.collection.createIndex({ likers: 1 });
    console.log('✅ Pin indexes created');

    // Board indexes
    const Board = mongoose.model('Board');
    await Board.collection.createIndex({ owner: 1, createdAt: -1 });
    await Board.collection.createIndex({ privacy: 1 });
    await Board.collection.createIndex({ "name": "text", "keywords": "text" });
    await Board.collection.createIndex({ createdAt: -1 });
    console.log('✅ Board indexes created');

    // Comment indexes
    const Comment = mongoose.model('Comment');
    await Comment.collection.createIndex({ pin: 1, createdAt: -1 });
    await Comment.collection.createIndex({ author: 1, createdAt: -1 });
    await Comment.collection.createIndex({ parentComment: 1 });
    console.log('✅ Comment indexes created');

    // Notification indexes
    const Notification = mongoose.model('Notification');
    await Notification.collection.createIndex({ recipient: 1, createdAt: -1 });
    await Notification.collection.createIndex({ recipient: 1, isRead: 1 });
    await Notification.collection.createIndex({ sender: 1, type: 1 });
    console.log('✅ Notification indexes created');

    console.log('🎉 All database indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Disconnected from MongoDB');
  }
}

addIndexes();
