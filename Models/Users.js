const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    username: String,
    password: String
});

const User = mongoose.model("user",UserSchema);

module.exports = User;