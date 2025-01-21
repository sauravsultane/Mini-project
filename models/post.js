const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

// Define the schema
const postSchema = new mongoose.Schema({
    user:
    {
        type:mongoose.Schema.Types.ObjectId,ref:"user"
    },
    date:{
        type:Date,
        default:Date.now()
    },
    contant:String,
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,ref:"user"
        }
    ]
});

// Create and export the model
const Posts = mongoose.model("post", postSchema);
module.exports = Posts;
