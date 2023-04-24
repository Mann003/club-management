const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");

const userSchema = mongoose.Schema({
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
  
    email: {
      type: String,
      unique: true,
      required: true,
    },
  
    password: {
      type: String,
      required: true,
      min: 8,
    },
    phone: {
        type: Number,
        min: 10,
    },

    club: {
        type: String,
    }
  });
  
  const user = mongoose.model("user", userSchema);

  module.exports = user;
  