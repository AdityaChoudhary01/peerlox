import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: false 
  },
  
  // ✅ R2 Storage Fields
  avatar: {
    type: String,
    default: "" // Full public URL for easy display
  },
  avatarKey: {
    type: String,
    default: "" // ✅ Key for R2 management/deletion
  },

  bio: {
    type: String,
    default: ""
  },
  university: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  savedNotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Note' 
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastSeen: { type: Date, default: Date.now },
  showLastSeen: { type: Boolean, default: true },
  
  // Community Features
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], 
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }], 

  // Stats
  noteCount: { 
    type: Number, 
    default: 0 
  },
  blogCount: { 
    type: Number, 
    default: 0 
  },
}, {
    timestamps: true 
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; 
  return await bcrypt.compare(enteredPassword, this.password);
};

// Singleton Pattern (Critical for Next.js)
const User = mongoose.models.User || mongoose.model('User', UserSchema, 'peerNoteznext_users');

export default User;