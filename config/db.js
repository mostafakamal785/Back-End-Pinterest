const mongoose = require("mongoose");



const connectDB = async () => {
    try {
        const con = await mongoose.connect("mongodb://127.0.0.1:27017/pinterest");
        console.log(`mongoDB connecte`);
        
    
    
    
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        
    }


};


module.exports = connectDB;
