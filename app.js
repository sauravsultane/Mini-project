const express = require("express");
const app = express();
const userModel = require("./models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET || "shhh";

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/post", isLoggedIn, async (req, res) => {
  let{content}=req.body;
  let user = await userModel.findOne({ email: req.user.email });
  let post = await postModel.create({
    user:user._id,
    content

  })
  user.posts.push(post._id);

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
