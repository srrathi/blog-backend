const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, name, contact, email, password, role } = req.body;

    // VALID DATA CHECK
    if (username === "" || name === "" || email === "" || password === "") {
      return res.status(400).json("Mandatory Fields are Empty !");
    }

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // SAVING USER TO DATABASE
    const newUser = new User({
      username,
      name,
      contact,
      email,
      password: hashedPass,
      role: role ? role : "candidate",
    });
    const user = await newUser.save();

    // DUPLICATE USER ERROR HANDLING
    if (!user) {
      return res.status(400).json("User Already Exists");
    } else {
      delete user._doc["password"];
      return res.status(200).json(user);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALID DATA CHECK
    if (email === "" || password === "") {
      return res.status(400).json("Mandatory Fields are Empty !");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json("Wrong Credentials");
    }

    // CHECKING PASSWORD
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json("Invalid Password, Please try again !");
    } else {
      // SENDING SIGNED JWT TOKEN
      const token = jwt.sign(
        {
          email: user.email,
          name: user.name,
          username: user.username,
          contact: user.contact,
          role: user.role,
          _id: user._id,
        },
        process.env.JWT_SECRET
      );
      const userData = { ...user._doc };
      delete userData["password"];
      return res.status(200).json({ user: userData, token });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
