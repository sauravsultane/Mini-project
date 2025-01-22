const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
