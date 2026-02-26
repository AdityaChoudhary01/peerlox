import mongoose from "mongoose";

const StudyEventSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true, // e.g., "Data Structures End-Sem"
    trim: true 
  },
  // 🚀 URL Friendly Slug: e.g., "adityas-os-roadmap"
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  examDate: { 
    type: Date, 
    required: true 
  },
  category: { 
    type: String, 
    default: "Exam" 
  },
  // 🚀 Links to Note, Blog, or Collection
  resources: [
    {
      resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
      resourceType: { 
        type: String, 
        required: true, 
        enum: ['Note', 'Blog', 'Collection'] 
      },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  // 🚀 Social & Privacy Features
  isPublic: { 
    type: Boolean, 
    default: false // Users can choose to publish their roadmap
  },
  clones: {
    type: Number,
    default: 0 // Tracks how many other students "Cloned" this plan
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

// Index for faster public roadmap discovery
StudyEventSchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.models.StudyEvent || mongoose.model("StudyEvent", StudyEventSchema);