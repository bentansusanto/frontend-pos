"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteRoleMutation } from "@/store/services/role.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string;
  roleName: string;
}

export function DeleteRoleDialog({
  isOpen,
  onClose,
  roleId,
  roleName,
}: DeleteRoleDialogProps) {
  const [deleteRole, { isLoading }] = useDeleteRoleMutation();

  const handleDelete = async () => {
    try {
      await deleteRole(roleId).unwrap();
      toast.success("Role deleted successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete role");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            <span className="font-bold text-foreground">"{roleName}"</span> role
            and remove it from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Role
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
