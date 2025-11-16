import mongoose from 'mongoose';
const boardSchema = new mongoose.Schema({
     name: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pins: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pin" }],
    keywords: { type: [String], default: [] },
    privacy: { type: String, enum: ["public", "private"], default: "public" }
})
export default mongoose.model('Board', boardSchema);