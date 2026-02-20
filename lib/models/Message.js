import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reactions: {
    type: [
      {
        emoji: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ],
    default: []
  },
  
  
  content: { type: String, required: true },
  readBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  edited: { type: Boolean, default: false },
  deletedForEveryone: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema,'peerNoteznext_messages');
