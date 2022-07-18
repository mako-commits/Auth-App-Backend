const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: [true, "Username already exist, try another"],
  },
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email already exist"],
  },
  password: {
    type: String,
    required: [true, "please provide a password!"],
    unique: false,
  },
});

//create a user table or collection if there is no table with that name already
module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
