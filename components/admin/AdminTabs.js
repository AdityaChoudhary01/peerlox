"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import UserManagementTable from "./UsersManagementTable";
import NoteModerationTable from "./NoteModerationTable";
import BlogModerationTable from "./BlogModerationTable";
import { FaUsers, FaFileAlt, FaPenNib } from "react-icons/fa";

export default function AdminTabs({ users, notes, blogs }) {
  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-secondary/20 p-1">
        <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-background">
          <FaUsers /> Users
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-background">
          <FaFileAlt /> Notes
        </TabsTrigger>
        <TabsTrigger value="blogs" className="gap-2 data-[state=active]:bg-background">
          <FaPenNib /> Blogs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <UserManagementTable initialUsers={users} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <NoteModerationTable initialNotes={notes} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="blogs">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <BlogModerationTable initialBlogs={blogs} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}