const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  timestamp: { type: String, required: true },
  note: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
