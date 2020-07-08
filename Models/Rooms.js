const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    roomname: String,
    player1username: { type: String , default: "" },
    player1: { type: String , default: "" },
    player2username: { type: String , default: "" },
    player2: { type: String , default: "" },
    startcounter: { type: Number, default: 0},
    player1score: { type: Number, default: 0},
    player2score: { type: Number, default: 0}
});

const Room = mongoose.model("room",RoomSchema);

module.exports = Room;