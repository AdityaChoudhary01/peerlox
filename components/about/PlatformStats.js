// components/about/PlatformStats.jsx
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Note from "@/lib/models/Note";

// 🚀 This component does the heavy lifting
export default async function PlatformStats() {
  await connectDB();
  
  // Fetch stats in parallel to save time
  const [userCount, noteCount] = await Promise.all([
    User.countDocuments(),
    Note.countDocuments()
  ]);

  return (
    <div className="flex gap-8 justify-center">
       <div className="p-6 bg-secondary/10 rounded-xl border border-border">
          <h3 className="text-3xl font-black text-cyan-400">{userCount}+</h3>
          <p className="text-muted-foreground uppercase text-xs">Students</p>
       </div>
       <div className="p-6 bg-secondary/10 rounded-xl border border-border">
          <h3 className="text-3xl font-black text-pink-400">{noteCount}+</h3>
          <p className="text-muted-foreground uppercase text-xs">Notes Shared</p>
       </div>
    </div>
  );
}