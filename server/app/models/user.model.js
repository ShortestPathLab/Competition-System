const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: {
      type: String,
      unique: true
    },
    github_id: {
      type: Number,
      unique:true
    },
    email: String,
    password: String,
    user_token: String,
    meta_data:{
      type: Object // meta_data includes: description,  license, organization, contact_email, affiliation, 
    },
    contact_email:String,
    subscribe: Boolean,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    accounts:[{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Account"
    }]
  })
);

module.exports = User;