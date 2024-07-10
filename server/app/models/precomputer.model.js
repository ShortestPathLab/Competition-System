const mongoose = require("mongoose");

const Precomputer = mongoose.model(
  "Precomputer",
  new mongoose.Schema({
    machine_name:String,
    ip: String,
    mac: String,
    hardware: String,
  })
);

module.exports = Precomputer;