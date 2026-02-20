import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Rating is 0 for replies, 1-5 for actual reviews
  rating: { type: Number, required: false, min: 0, max: 5, default: 0 }, 
  comment: { type: String, required: true },
  parentReviewId: { type: mongoose.Schema.Types.ObjectId, default: null } 
}, {
  timestamps: true
});

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: [20, 'Description must be at least 20 characters long'] 
  },
  university: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  year: { type: String, required: true }, // Changed to String to handle "1st Year", "Final Year", etc.
  
  // ✅ R2 STORAGE FIELDS
  fileName: { type: String, required: true },   // Original name (e.g. Math_Notes.pdf)
  fileType: { type: String, required: true },   // MIME type
  fileSize: { type: Number, required: true },   // Bytes
  fileKey: { type: String, required: true },    // ✅ Path in R2 (e.g. notes/user_id/timestamp.pdf)
  thumbnailKey: { type: String, default: null }, // ✅ Path in R2 for the WebP preview
  
  // Legacy field (Can be removed once old data is migrated)
  filePath: { type: String, required: false }, 

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
  reviews: [reviewSchema],
  
  // Stats
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  downloadCount: { type: Number, required: true, default: 0 },
  viewCount: { type: Number, required: true, default: 0 },
  isFeatured: { type: Boolean, required: true, default: false }
}, {
  timestamps: true 
});

// Search Optimization
NoteSchema.index({ title: 'text', description: 'text', subject: 'text', university: 'text' });

const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema, 'peerNoteznext_notes');

export default Note;