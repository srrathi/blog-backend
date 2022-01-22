const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contact: {
      type: Number,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "candidate",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    comments: [
      {
        type: {
          type: { type: String },
        },
        title: {
          type: String,
          trim: true,
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
        comment: {
          type: String,
          trim: true,
        },
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
