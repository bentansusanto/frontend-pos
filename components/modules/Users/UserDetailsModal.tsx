"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User } from "./UsersDataTable";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Detailed information about the user and their profile.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="font-bold">ID</Label>
            <div className="text-sm text-gray-700">{user.id}</div>
          </div>
          <div className="grid gap-2">
            <Label className="font-bold">Name</Label>
            <div className="text-sm text-gray-700">{user.name}</div>
          </div>
          <div className="grid gap-2">
            <Label className="font-bold">Email</Label>
            <div className="text-sm text-gray-700">{user.email}</div>
          </div>
          <div className="grid gap-2">
            <Label className="font-bold">Role</Label>
            <div className="text-sm text-gray-700 capitalize">{user.role}</div>
          </div>
          <div className="grid gap-2">
            <Label className="font-bold">Status</Label>
            <div className="text-sm text-gray-700">
              {user.is_verified ? "Verified" : "Unverified"}
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="font-bold">Address</Label>
            <div className="text-sm text-gray-700">
              {user.profile?.address || "-"}
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="font-bold">Phone</Label>
            <div className="text-sm text-gray-700">
              {user.profile?.phone || "-"}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
