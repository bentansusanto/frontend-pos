"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFindProfileByUserIdQuery } from "@/store/services/profile.service";
import { Loader2 } from "lucide-react";
import { useProfileForm } from "./hooks";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function EditProfileModal({ isOpen, onClose, userId }: EditProfileModalProps) {
  const { data: profileData, isLoading: isFetching } = useFindProfileByUserIdQuery(userId, {
    skip: !isOpen || !userId
  });

  const profile = profileData?.data;

  const { formik, isLoading: isSaving } = useProfileForm({
    userId,
    profileId: profile?.id,
    initialValues: profile
      ? {
          address: profile.address,
          phone: profile.phone
        }
      : undefined,
    onSuccess: () => {
      onClose();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            {profile ? "Update user profile details." : "Create user profile details."}
          </DialogDescription>
        </DialogHeader>
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...formik.getFieldProps("address")} />
                {formik.touched.address && formik.errors.address && (
                  <div className="text-xs text-red-500">{formik.errors.address}</div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...formik.getFieldProps("phone")} />
                {formik.touched.phone && formik.errors.phone && (
                  <div className="text-xs text-red-500">{formik.errors.phone}</div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
