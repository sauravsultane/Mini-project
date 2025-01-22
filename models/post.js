const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

// Define the schema
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  content: { type: String, required: true },
  likes: [
    {
      
      type: mongoose.Schema.Types.ObjectId, ref: 'User'
    
    },
  ],
});

// Create and export the model
const Posts = mongoose.model("post", postSchema);
module.exports = Posts;
