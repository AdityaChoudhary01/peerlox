import mongoose from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // ✅ Added index for faster profile dashboard loading
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }]
}, {
  timestamps: true
});

// ✅ Compound index: Useful if you ever allow users to search within their own collections
CollectionSchema.index({ user: 1, name: 1 });

const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema, 'peerNoteznext_collections');

export default Collection;