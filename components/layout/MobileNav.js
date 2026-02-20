"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";

export default function MobileNav({ session, navLinks }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left font-black tracking-tighter text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#ff00cc]">
            PeerNotez
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setOpen(false)}
              className={`text-lg font-medium transition-colors hover:text-primary ${
                pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="my-4 border-t border-border" />

          {session ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 text-lg text-muted-foreground hover:text-primary">
                <UserIcon className="w-5 h-5" /> My Dashboard
              </Link>
              <Link href="/notes/upload" onClick={() => setOpen(false)}>
                <Button className="w-full justify-start mt-2">Upload Note</Button>
              </Link>
              <Button variant="ghost" className="justify-start px-0 text-red-400 hover:text-red-500 hover:bg-transparent" onClick={() => signOut()}>
                <LogOut className="w-5 h-5 mr-2" /> Log out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">Log In</Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}