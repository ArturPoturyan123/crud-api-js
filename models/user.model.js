const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [false, "Please enter user name"],
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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // hash only if password changed/new
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
