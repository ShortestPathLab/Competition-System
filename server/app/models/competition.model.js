const mongoose = require("mongoose");

const Competition = mongoose.model(
  "Competition",
  new mongoose.Schema({
    name: {
      type:String,
      index:true
    },
    track: {
      type:String,
      index:true
    },
    start_time: Date,
    end_time: Date,
    active: Boolean,
  })
);

module.exports = Competition;