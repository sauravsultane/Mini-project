const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const upload=require("./config/multerconfig")

const jwtSecret = process.env.JWT_SECRET || "shhh";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/profile/upload", (req, res) => {
  res.render("profileupload");
});
app.post("/upload",isLoggedIn, upload.single("image"),async(req, res) => {
  let user = await userModel.findOne({email:req.user.email});
  user.profilepic=req.file.filename;
  await user.save();
  res.redirect("/profile");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  try {
    // Populate the posts with full content
    let user = await userModel.findOne({ email: req.user.email }).populate({
      path: "posts"// Reference to posts
      // select: "content", // Include only the content field
    });

    if (!user) return res.status(404).send("User not found");
    console.log(user); // Debugging: Ensure user data is being fetched
    res.render("profile", { user }); // Pass user data to the frontend
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "", { httpOnly: true, secure: true });
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    let user = await userModel.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid credentials");

    let token = jwt.sign({ email, userid: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Login error");
  }
});

app.post("/register", async (req, res) => {
  let { email, password, username, name, age } = req.body;

  try {
    let existingUser = await userModel.findOne({ email });
    if (existingUser) return res.status(409).send("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await userModel.create({
      username,
      email,
      name,
      password: hashedPassword,
      age,
    });

    let token = jwt.sign({ email, userid: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true, secure: true });
    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Registration error");
  }
});

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data;
    next();
  } catch (err) {
    res.redirect("/login");
  }
}

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
