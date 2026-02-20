"use client";

import { useState } from "react";
import { toggleUserRole, deleteUser } from "@/actions/admin.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ShieldAlert, ShieldCheck, Loader2, Crown, UserCircle } from "lucide-react";

export default function UserManagementTable({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState(null);
  const { toast } = useToast();

  const handleToggleRole = async (userId, currentRole) => {
    setLoadingId(userId);
    const res = await toggleUserRole(userId, currentRole);
    if (res.success) {
      setUsers(users.map(u => u._id === userId ? { ...u, role: currentRole === 'admin' ? 'user' : 'admin' } : u));
      toast({ title: "Authority Updated", description: `User is now a ${currentRole === 'admin' ? 'User' : 'Admin'}.` });
    } else {
      toast({ title: "Update Failed", description: res.error, variant: "destructive" });
    }
    setLoadingId(null);
  };

  const handleDelete = async (userId) => {
    if (!confirm("CRITICAL ACTION: Are you sure? This will wipe the user's profile and delete all associated  assets (avatars).")) return;
    setLoadingId(userId);
    const res = await deleteUser(userId);
    if (res.success) {
      setUsers(users.filter(u => u._id !== userId));
      toast({ title: "User Deleted", variant: "destructive" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoadingId(null);
  };

  return (
    <div className="border rounded-3xl overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[700px]">
          <thead className="bg-white/5 text-white/40 uppercase text-[10px] font-black tracking-[0.2em] border-b border-white/5">
            <tr>
              <th className="px-8 py-5">Identity</th>
              <th className="px-6 py-5">Clearance Level</th>
              <th className="px-6 py-5 hidden sm:table-cell text-center">Contribution</th>
              <th className="px-8 py-5 text-right">Administrative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => {
              const isMainAdmin = user.email === process.env.NEXT_PUBLIC_MAIN_ADMIN_EMAIL;

              return (
                <tr key={user._id} className={`transition-all group ${isMainAdmin ? 'bg-yellow-500/[0.02]' : 'hover:bg-white/[0.02]'}`}>
                  
                  {/* 1. Profile Identity */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className={`h-11 w-11 border-2 transition-transform group-hover:scale-105 ${isMainAdmin ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10'}`}>
                          <AvatarImage src={user.avatar} referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-secondary font-black">{user.name?.charAt(0) || "?"}</AvatarFallback>
                        </Avatar>
                        {isMainAdmin && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-lg">
                                <Crown className="w-3 h-3 text-black" />
                            </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white text-base truncate max-w-[180px]">
                            {user.name}
                        </span>
                        <span className="text-[10px] text-white/30 font-mono truncate max-w-[180px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  {/* 2. Authority Level */}
                  <td className="px-6 py-4">
                    {isMainAdmin ? (
                         <Badge className="bg-yellow-500 text-black border-none font-black text-[9px] tracking-[0.1em] px-3 py-1">
                           ROOT ADMIN
                         </Badge>
                    ) : (
                        <Badge variant="outline" className={`font-black text-[9px] tracking-[0.1em] px-3 py-1 uppercase border-2 ${user.role === 'admin' ? "border-purple-500/50 text-purple-400 bg-purple-500/5" : "border-cyan-500/50 text-cyan-400 bg-cyan-500/5"}`}>
                          {user.role}
                        </Badge>
                    )}
                  </td>
                  
                  {/* 3. Contribution Stats */}
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-xs font-black text-white/70">
                         {user.exactNoteCount || user.noteCount || 0} <span className="text-[9px] text-white/30 tracking-widest uppercase ml-1">Notes</span>
                       </span>
                       <span className="text-xs font-black text-white/70">
                         {user.exactBlogCount || user.blogCount || 0} <span className="text-[9px] text-white/30 tracking-widest uppercase ml-1">Blogs</span>
                       </span>
                    </div>
                  </td>
                  
                  {/* 4. Administrative Actions */}
                  <td className="px-8 py-5 text-right space-x-3 whitespace-nowrap">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-9 px-4 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${user.role === 'admin' ? 'hover:bg-red-500/10 hover:text-red-400 text-white/40' : 'hover:bg-cyan-500/10 hover:text-cyan-400 text-white/40'}`}
                      onClick={() => handleToggleRole(user._id, user.role)}
                      disabled={loadingId === user._id || isMainAdmin}
                    >
                      {loadingId === user._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                      ) : user.role === 'admin' ? (
                        <><ShieldAlert className="w-3.5 h-3.5 mr-2"/> Demote</>
                      ) : (
                        <><ShieldCheck className="w-3.5 h-3.5 mr-2"/> Promote</>
                      )}
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDelete(user._id)}
                      disabled={loadingId === user._id || isMainAdmin}
                    >
                      {loadingId === user._id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5" />}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-white/20">
            <UserCircle size={48} className="mb-4 opacity-5" />
            <p className="font-bold uppercase tracking-[0.4em] text-[10px]">No users registered in system</p>
        </div>
      )}
    </div>
  );
}