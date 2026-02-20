import mongoose from 'mongoose';

const blogReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: false, min: 0, max: 5, default: 0 }, 
  comment: { type: String, required: true },
  parentReviewId: { type: mongoose.Schema.Types.ObjectId, default: null } 
}, {
  timestamps: true
});

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true }, // Markdown content
  slug: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  
  // Dynamic categories/filters
  tags: { type: [String], default: [] },
  
  // ✅ R2 Storage Fields
  coverImage: { type: String, default: "" },      // The full public URL
  coverImageKey: { type: String, default: "" },   // The R2 object key (needed for deletion)

  // Blog Management & Stats
  reviews: [blogReviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  viewCount: { type: Number, required: true, default: 0 }, 
  
  isFeatured: { type: Boolean, required: true, default: false },
}, {
  timestamps: true 
});

// Create text index for blog search
BlogSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });

// Auto-generate slug logic
BlogSchema.pre('validate', function(next) {
    if (this.isNew && !this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
            
        // Handle potential slug collisions by adding a short unique string if needed
        // (Optional: implement unique slug logic here if you expect many duplicate titles)
    }
    next();
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema, 'peerNoteznext_blogs');

export default Blog;