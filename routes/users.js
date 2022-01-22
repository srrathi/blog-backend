const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
// UPDATE
router.put("/update/:id", async (req, res) => {
  const { username, name, email, contact } = req.body;
  if (username === "" || name === "" || email === "") {
    return res.status(400).json("Mandatory fields are Empty !");
  }
  const token = req.headers["x-access-token"];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded._id === req.params.id) {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              username,
              name,
              email,
              contact,
            },
          },
          { new: true }
        );

        await Post.updateMany(
          { id: req.params.id },
          {
            $set: {
              username,
            },
          },
          { new: true }
        );
        if (updatedUser) {
          const token = jwt.sign(
            {
              email: updatedUser.email,
              name: updatedUser.name,
              username: updatedUser.username,
              contact: updatedUser.contact,
              role: updatedUser.role,
              _id: updatedUser._id,
            },
            process.env.JWT_SECRET
          );
          delete updatedUser._doc["password"];
          // console.log(updatedUser);
          return res.status(200).json({ user: updatedUser, token });
        } else {
          return res
            .status(400)
            .json("Cannot find User or Duplicate User data");
        }
      } catch (error) {
        return res.status(500).json(error);
      }
    } else {
      return res.status(400).json("Unauthorized User, Access Denied !");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// DELETE
router.delete("/delete/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded._id === req.params.id) {
      try {
        await Post.deleteMany({ username: decoded.username });
        await User.findByIdAndDelete(req.params.id);
        return res.status(200).json("User has been deleted successfully !");
      } catch (error) {
        return res.status(500).json(error);
      }
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// GET USER PROFILE
router.get("/profile/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded._id === req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        delete user._doc["password"];
        return res.status(200).json(user);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
