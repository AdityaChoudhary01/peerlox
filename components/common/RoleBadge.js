import { Badge } from "@/components/ui/badge";
import { ShieldCheck, User } from "lucide-react";

export default function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <Badge variant="default" className="bg-purple-500 hover:bg-purple-600 gap-1 text-[10px] px-2">
        <ShieldCheck className="w-3 h-3" /> Admin
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="gap-1 text-[10px] px-2">
      <User className="w-3 h-3" /> Student
    </Badge>
  );
}