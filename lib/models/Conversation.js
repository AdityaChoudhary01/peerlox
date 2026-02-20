import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  },
  pinnedMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  }
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
