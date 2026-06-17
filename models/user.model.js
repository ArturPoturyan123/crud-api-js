const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, "Please enter user email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter user password"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    age: {
      type: Number,
      required: false,
    },
    address: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
