"use server";

import connectDB from "@/lib/db";
import Conversation from "@/lib/models/Conversation";
import Message from "@/lib/models/Message";
import User from "@/lib/models/User";
import mongoose from "mongoose";


export async function searchUsersForChat(query, currentUserId) {
  if (!query) return [];

  await connectDB();

  try {
    // Debug log to ensure the function is actually receiving the inputs
    console.log(`🔍 Searching for: "${query}" | Excluding ID: ${currentUserId}`);

    // 1. Make it safe for Regex
    const safeSearch = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = { $regex: safeSearch, $options: 'i' };

    // 2. Safely convert the string ID to a MongoDB ObjectId
    const excludeId = mongoose.Types.ObjectId.isValid(currentUserId) 
      ? new mongoose.Types.ObjectId(currentUserId) 
      : currentUserId;

    // 3. Fetch users (Flattened query object - much safer than $and)
    const users = await User.find({
      _id: { $ne: excludeId }, // Now comparing ObjectId to ObjectId
      name: searchRegex
    })
    .select('name avatar')
    .limit(8)
    .lean();

    console.log(`✅ Found ${users.length} matching users.`);

    // 4. Serialize for Next.js
    return users.map(u => ({
      ...u,
      _id: u._id.toString()
    }));

  } catch (error) {
    console.error("❌ Chat user search error:", error);
    return [];
  }
}

// ===============================
// 1️⃣ GET OR CREATE CONVERSATION
// ===============================
export async function getOrCreateConversation(userA, userB) {
  await connectDB();

  let convo = await Conversation.findOne({
    participants: { $all: [userA, userB] }
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [userA, userB]
    });
  }

  return convo;
}


// ===============================
// 2️⃣ SEND MESSAGE
// ===============================
export async function sendMessage({ senderId, receiverId, content }) {
  await connectDB();

  const convo = await getOrCreateConversation(senderId, receiverId);

  const message = await Message.create({
    conversation: convo._id,
    sender: senderId,
    content,
    readBy: [senderId]
  });

  convo.lastMessage = message._id;
  await convo.save();

  return {
    _id: message._id.toString(),
    conversationId: convo._id.toString(),
    sender: senderId,
    content,
    createdAt: message.createdAt.toISOString(),
    readBy: [senderId]
  };
}

// ===============================
// 🔹 MARK CONVERSATION READ (Optimized Version we built earlier)
// ===============================
export async function markConversationRead(conversationId, userId) {
  try {
    await connectDB();
    // Assuming you imported Message model
    const result = await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: userId }, 
        readBy: { $ne: userId }  
      },
      { $addToSet: { readBy: userId } }
    );
    return { success: true, updatedCount: result.modifiedCount };
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    return { success: false, error: error.message };
  }
}

// Modify this in chat.service.js
export async function getConversationWithMessages(userA, userB) {
  await connectDB();

  let convo = await Conversation.findOne({
    participants: { $all: [userA, userB] }
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [userA, userB]
    });
  }

  // 🔹 FIX: Only get the latest 20 messages for the initial load!
  const messages = await Message.find({
    conversation: convo._id
  })
    .sort({ createdAt: -1 }) // Sort newest first
    .limit(20)               // Grab only 20
    .lean();

  const formattedMessages = messages.reverse().map(m => ({ // Reverse back to chronological
    _id: m._id.toString(),
    sender: m.sender.toString(),
    content: m.content,
    readBy: m.readBy.map(id => id.toString()),
    edited: m.edited,
    deletedForEveryone: m.deletedForEveryone,
    createdAt: m.createdAt.toISOString()
  }));

  return {
    conversationId: convo._id.toString(),
    messages: formattedMessages
  };
}
  

  export async function editMessage(messageId, newContent) {
    await connectDB();
    await Message.findByIdAndUpdate(messageId, {
      content: newContent,
      edited: true
    });
  }
  
  export async function deleteMessageForEveryone(messageId) {
    await connectDB();
    await Message.findByIdAndUpdate(messageId, {
      deletedForEveryone: true
    });
  }

  
  export async function getUserConversations(userId) {
    await connectDB();
  
    const userObjectId = new mongoose.Types.ObjectId(userId);
  
    const conversations = await Conversation.find({
      participants: userObjectId
    })
      .populate({
        path: "lastMessage",
        select: "content sender readBy createdAt"
      })
      .populate({
        path: "participants",
        select: "name avatar"
      })
      .lean();
  
    return conversations.map(convo => {
      const otherUser = convo.participants.find(
        p => p._id.toString() !== userId
      );
  
      const lastMessage = convo.lastMessage;
  
      let unreadCount = 0;
  
      if (lastMessage) {
        const isSentByMe =
          lastMessage.sender.toString() === userId;
  
        const isRead =
          lastMessage.readBy?.some(
            id => id.toString() === userId
          );
  
        if (!isSentByMe && !isRead) {
          unreadCount = 1;
        }
      }
  
      return {
        conversationId: convo._id.toString(),
        user: {
          _id: otherUser._id.toString(),
          name: otherUser.name,
          avatar: otherUser.avatar
        },
        lastMessage: lastMessage?.content || "",
        lastMessageDate: lastMessage?.createdAt || null,
        unreadCount
      };
    });
  }
  
  export async function deleteConversation(conversationId) {
    await connectDB();
  
    await Message.deleteMany({
      conversation: conversationId
    });
  
    await Conversation.findByIdAndDelete(conversationId);
  
    return { success: true };
  }
  export async function toggleReaction(messageId, userId, emoji) {
    await connectDB();
  
    const message = await Message.findById(messageId);
  
    if (!message) {
      throw new Error("Message not found");
    }
  
    // 🔥 Ensure reactions always exists
    if (!message.reactions) {
      message.reactions = [];
    }
  
    const existing = message.reactions.find(
      r =>
        r.userId.toString() === userId.toString() &&
        r.emoji === emoji
    );
  
    if (existing) {
      message.reactions = message.reactions.filter(
        r =>
          !(
            r.userId.toString() === userId.toString() &&
            r.emoji === emoji
          )
      );
    } else {
      message.reactions.push({
        emoji,
        userId
      });
    }
  
    await message.save();
  
    return {
      messageId,
      reactions: message.reactions.map(r => ({
        emoji: r.emoji,
        userId: r.userId.toString()
      }))
    };
  }
  

  // ===============================
// 🔟 GET TOTAL UNREAD COUNT
// ===============================
export async function getUnreadCount(userId) {
  await connectDB();

  const conversations = await Conversation.find({
    participants: userId
  }).populate({
    path: "lastMessage",
    select: "sender readBy"
  });

  let total = 0;

  conversations.forEach(convo => {
    const last = convo.lastMessage;

    if (
      last &&
      last.sender.toString() !== userId &&
      !last.readBy?.map(id => id.toString()).includes(userId)
    ) {
      total += 1;
    }
  });

  return total;
}

// Add this to your chat.service.js

export async function getOlderMessages(conversationId, page = 2) {
  const MESSAGES_PER_PAGE = 20;
  
  await connectDB();

  // We sort by createdAt: -1 to get newest first, skip the ones we have, 
  // then limit to the next batch, and finally reverse them so they render chronologically.
  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * MESSAGES_PER_PAGE)
    .limit(MESSAGES_PER_PAGE)
    .lean();

  return messages.reverse().map(m => ({
    _id: m._id.toString(),
    sender: m.sender.toString(),
    content: m.content,
    readBy: m.readBy.map(id => id.toString()),
    edited: m.edited,
    deletedForEveryone: m.deletedForEveryone,
    createdAt: m.createdAt.toISOString()
  }));
}