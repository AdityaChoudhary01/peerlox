require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// Minimal Schema to access the database directly without Next.js imports
const NoteSchema = new mongoose.Schema({
  title: String,
  slug: String
}, { strict: false }); // strict: false lets us update the document without defining every single field

const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema, 'StuHive_notes');

async function migrateSlugs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB...");

    // Find all notes where 'slug' is missing, null, or an empty string
    const notesToUpdate = await Note.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: "" }
      ]
    });

    if (notesToUpdate.length === 0) {
      console.log("✨ All notes already have slugs! No migration needed.");
      process.exit(0);
    }

    console.log(`🚨 Found ${notesToUpdate.length} notes without slugs. Starting migration...`);

    let count = 0;
    for (const note of notesToUpdate) {
      if (!note.title) continue; // Skip if somehow there's no title

      // 1. Generate base slug from title
      let baseSlug = note.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace special chars/spaces with hyphens
        .replace(/(^-|-$)+/g, '');   // Trim hyphens from ends

      // 2. Add random 4-digit suffix
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      note.slug = `${baseSlug}-${randomSuffix}`;

      // 3. Save the updated note
      await note.save();
      count++;
      
      console.log(`[${count}/${notesToUpdate.length}] Updated: ${note.title.substring(0, 30)}... -> ${note.slug}`);
    }

    console.log(`\n🎉 MIGRATION COMPLETE! Successfully generated ${count} SEO slugs.`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Migration Error:", error);
    process.exit(1);
  }
}

migrateSlugs();