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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdatePermissionMutation } from "@/store/services/role.service";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Permission } from "./PermissionsDataTable";

const formSchema = z.object({
  module: z.string().min(1, "Module is required"),
  action: z.string().min(1, "Action is required"),
  description: z.string().min(1, "Description is required"),
});

interface EditPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission;
}

export const EditPermissionDialog: React.FC<EditPermissionDialogProps> = ({
  isOpen,
  onClose,
  permission,
}) => {
  const [updatePermission, { isLoading }] = useUpdatePermissionMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      module: permission.module,
      action: permission.action,
      description: permission.description,
    },
  });

  useEffect(() => {
    if (permission) {
        form.reset({
            module: permission.module,
            action: permission.action,
            description: permission.description,
        });
    }
  }, [permission, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updatePermission({
        id: permission.id,
        data: values,
      }).unwrap();
      toast.success("Permission updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update permission");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
          <DialogDescription>
            Update permission details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. products" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. products:create" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Permission description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Permission"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
