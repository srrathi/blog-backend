const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// CREATE NEW POST
router.post("/create", async (req, res) => {
  const { title, desc, photo, username, id } = req.body;
  if (title === "" || desc === "" || username === "" || id === "") {
    return res.status(400).json("Mandatory fields are Empty !");
  }
  const token = req.headers["x-access-token"];
  // console.log(token);

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    if (decoded && decoded.username === username && decoded.role === "admin") {
      const newPost = new Post({
        title,
        desc,
        photo,
        username,
        id,
      });
      const savedPost = await newPost.save();
      return res.status(200).json(savedPost);
    } else {
      return res.status(400).json("Unauthorized User, Access Denied !");
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error, message: "Internal server error occurred" });
  }
});

// UPDATE POST
router.put("/update/:id", async (req, res) => {
  const { title, desc, photo, username } = req.body;
  if (title === "" || desc === "" || username === "") {
    return res.status(400).json("Mandatory fields are Empty !");
  }
  const token = req.headers["x-access-token"];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.username === username && decoded.role === "admin") {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            title,
            desc,
            photo,
          },
        },
        { new: true }
      );
      if (updatedPost) {
        return res.status(200).json(updatedPost);
      } else {
        return res.status(400).json("Cannot find Post");
      }
    } else {
      return res.status(400).json("Unauthorized User, Access Denied !");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// DELETE POST
router.delete("/delete/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.role === "admin") {
      const post = await Post.findById(req.params.id);
      if (post) {
        try {
          await post.delete();
          res.status(200).json("Post has been deleted !");
        } catch (error) {
          return res.status(500).json(error);
        }
      } else {
        return res.status(400).json("Cannot find Post");
      }
    } else {
      return res.status(400).json("Unauthorized User, Access Denied !");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// GET POST
router.get("/fetch/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      return res.status(200).json(post);
    } else {
      return res.status(400).json("Cannot find Post");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// GET ALL POSTS
router.get("/allPosts", async (req, res) => {
  const username = req.query.user;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else {
      posts = await Post.find();
    }
    if (posts) {
      return res.status(200).json(posts);
    } else {
      return res.status(400).json("Invalid Request !");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// LIKE A POST
router.patch("/like/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.email) {
      const postId = req.params.id;
      const userId = decoded._id;

      const user = await User.findById(userId);
      const isLiked = user.likes && user.likes.includes(postId);
      const option = isLiked ? "$pull" : "$addToSet";
      await User.findByIdAndUpdate(
        userId,
        {
          [option]: { likes: postId },
        },
        { new: true }
      );

      const post = await Post.findByIdAndUpdate(
        postId,
        {
          [option]: { likes: userId },
        },
        { new: true }
      );

      res.status(200).json(post);
    } else {
      return res.status(400).json("Unauthorized User, Access Denied !");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// COMMENT ON A POST
router.put("/comment/:id", async (req, res) => {
  const token = req.headers["x-access-token"];
  if (req.body.title === "" || req.body.comment === "") {
    return res.status(400).json("Please add a comment");
  }
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.email) {
      const postId = req.params.id;
      const userId = decoded._id;
      const username = decoded.username;

      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: {
            comments: {
              title: req.body.title,
              id: postId,
              comment: req.body.comment,
            },
          },
        },
        { new: true }
      );

      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: {
            comments: {
              username,
              id: userId,
              comment: req.body.comment,
            },
          },
        },
        { new: true }
      );

      res.status(200).json(post);
    } else {
      return res.status(400).json("Unauthorized User, Access Denied !");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
