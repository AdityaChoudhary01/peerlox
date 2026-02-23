"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user.actions"; // ✅ Switched to updateProfile to handle all fields
import { Edit2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditBio({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [university, setUniversity] = useState(user?.university || "");
  const [location, setLocation] = useState(user?.location || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Automatically caps bio at 300 to match DB schema
    const res = await updateProfile(user._id, { 
        bio: bio.trim().substring(0, 300),
        university: university.trim(),
        location: location.trim()
    });
    setIsSaving(false);
    
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error || "Failed to update profile details.");
    }
  };

  if (!isEditing) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center group w-full">
        {bio ? (
           <p className="text-gray-300 italic text-center max-w-lg mb-3 leading-relaxed">
             &quot;{bio}&quot;
           </p>
        ) : (
           <p className="text-gray-500 italic text-center max-w-lg mb-3">
             Add a short bio, university, and location...
           </p>
        )}
        
        <div className="flex flex-wrap justify-center gap-4 text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            {university && <span className="flex items-center gap-1">🎓 {university}</span>}
            {location && <span className="flex items-center gap-1">📍 {location}</span>}
        </div>

        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-xs uppercase tracking-widest font-bold text-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity"
        >
            <Edit2 className="w-3 h-3 mr-2" /> Edit Details
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full max-w-lg mx-auto flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        maxLength={300}
        placeholder="Computer Science Student... I love writing about AI and sharing my notes!"
        className="w-full bg-background/50 border border-white/20 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-cyan-400 outline-none resize-none min-h-[100px]"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
         <Input 
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="University / College"
            className="bg-background/50 border-white/20 text-white"
         />
         <Input 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className="bg-background/50 border-white/20 text-white"
         />
      </div>

      <div className="flex w-full justify-between items-center px-1">
        <span className="text-[10px] text-gray-500 font-mono">{bio.length}/300</span>
        <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving} className="text-gray-300">Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
            </Button>
        </div>
      </div>
    </div>
  );
}