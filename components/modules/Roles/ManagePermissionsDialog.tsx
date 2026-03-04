"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useAssignPermissionsMutation,
  useGetAllPermissionsQuery,
  useGetRoleByIdQuery
} from "@/store/services/role.service";
import { ChevronLeft, ChevronRight, Loader2, Search, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Role } from "./RolesDataTable";

interface ManagePermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export const ManagePermissionsDialog: React.FC<ManagePermissionsDialogProps> = ({
  isOpen,
  onClose,
  role
}) => {
  const MODULES_PER_PAGE = 5;

  const [overridesByRole, setOverridesByRole] = useState<Record<string, Record<string, boolean>>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetAllPermissionsQuery(
    undefined,
    { skip: !isOpen }
  );

  const {
    data: roleData,
    isLoading: isLoadingRole,
    isFetching: isFetchingRole
  } = useGetRoleByIdQuery(role?.id || "", {
    skip: !isOpen || !role,
    refetchOnMountOrArgChange: true
  });

  const [assignPermissions, { isLoading: isAssigning }] = useAssignPermissionsMutation();

  const allPermissions = permissionsData || [];
  const roleKey = role?.id || "unknown";

  const basePermissionIds = React.useMemo<string[]>(
    () => roleData?.permissions?.map((p: any) => p.id) || [],
    [roleData]
  );
  const basePermissionIdSet = React.useMemo(() => new Set(basePermissionIds), [basePermissionIds]);
  const selectedOverrides = overridesByRole[roleKey] || {};

  const selectedPermissions = React.useMemo<string[]>(() => {
    const set = new Set(basePermissionIds);
    Object.entries(selectedOverrides).forEach(([id, isSelected]) => {
      if (isSelected) set.add(id);
      else set.delete(id);
    });
    return Array.from(set);
  }, [basePermissionIds, selectedOverrides]);

  // Group by module, filter, then paginate groups
  const { pageGroups, totalModules, totalPages } = React.useMemo(() => {
    const filtered = allPermissions.filter((p: any) => {
      const searchStr = `${p.module} ${p.action} ${p.description}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });

    // Group by module
    const groupMap: Record<string, any[]> = {};
    filtered.forEach((p: any) => {
      const key = p.module || p.action.split(":")[0] || "Other";
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(p);
    });

    const allGroups = Object.entries(groupMap); // [moduleName, permissions[]]
    const totalPages = Math.ceil(allGroups.length / MODULES_PER_PAGE);
    const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));
    const pageGroups = allGroups.slice(
      safePage * MODULES_PER_PAGE,
      (safePage + 1) * MODULES_PER_PAGE
    );

    return {
      pageGroups,
      totalModules: allGroups.length,
      totalPages
    };
  }, [allPermissions, searchTerm, currentPage]);

  const handleTogglePermission = (permissionId: string) => {
    const isCurrentlySelected = selectedPermissions.includes(permissionId);
    const nextSelected = !isCurrentlySelected;
    const baseHas = basePermissionIdSet.has(permissionId);

    setOverridesByRole((prev) => {
      const roleOverrides = { ...(prev[roleKey] || {}) };
      if (nextSelected === baseHas) delete roleOverrides[permissionId];
      else roleOverrides[permissionId] = nextSelected;
      return { ...prev, [roleKey]: roleOverrides };
    });
  };

  const handleToggleModule = (modulePermissions: any[], isChecked: boolean) => {
    setOverridesByRole((prev) => {
      const roleOverrides = { ...(prev[roleKey] || {}) };
      modulePermissions.forEach((permission) => {
        const baseHas = basePermissionIdSet.has(permission.id);
        if (isChecked === baseHas) delete roleOverrides[permission.id];
        else roleOverrides[permission.id] = isChecked;
      });
      return { ...prev, [roleKey]: roleOverrides };
    });
  };

  const handleSave = async () => {
    if (!role) return;
    try {
      await assignPermissions({
        role_id: role.id,
        permission_ids: selectedPermissions
      }).unwrap();
      toast.success("Permissions updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update permissions");
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setCurrentPage(0);
    setOverridesByRole((prev) => {
      const next = { ...prev };
      delete next[roleKey];
      return next;
    });
    onClose();
  };

  const globalModuleOffset = currentPage * MODULES_PER_PAGE;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}>
      <DialogContent className="flex h-[90vh] w-[98vw] max-w-6xl flex-col overflow-hidden p-0 shadow-2xl transition-all duration-300">
        <DialogHeader className="border-b p-6 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl">
                <ShieldCheck className="text-primary h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Manage Permissions</DialogTitle>
                <DialogDescription className="mt-0.5">
                  Configure access for{" "}
                  <span className="text-foreground font-semibold">{role?.name}</span>
                </DialogDescription>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="bg-muted/50 border-none pl-9 focus-visible:ring-1"
              />
            </div>
          </div>
        </DialogHeader>

        {isLoadingPermissions || isLoadingRole || isFetchingRole ? (
          <div className="flex flex-1 items-center justify-center p-12">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="flex-1 overflow-y-auto px-6">
            <div className="py-6">
              {/* Info bar */}
              {totalModules > 0 && (
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium">
                    Modules{" "}
                    <span className="text-foreground font-bold">
                      {globalModuleOffset + 1}–
                      {Math.min(globalModuleOffset + MODULES_PER_PAGE, totalModules)}
                    </span>{" "}
                    of <span className="text-foreground font-bold">{totalModules}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Page <span className="text-foreground font-bold">{currentPage + 1}</span> /{" "}
                    <span className="text-foreground font-bold">{totalPages}</span>
                  </p>
                </div>
              )}

              {pageGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Search className="text-muted-foreground h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">No permissions found</h3>
                  <p className="text-muted-foreground">Try searching with a different term</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(0);
                    }}
                    className="text-primary mt-2">
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {pageGroups.map(([moduleName, permissions], idx) => {
                    const isAllSelected = permissions.every((p) =>
                      selectedPermissions.includes(p.id)
                    );
                    const isSomeSelected = permissions.some((p) =>
                      selectedPermissions.includes(p.id)
                    );

                    return (
                      <div
                        key={moduleName}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Module header */}
                        <div className="bg-background/95 sticky top-0 z-10 -mx-2 mb-4 flex items-center justify-between rounded-lg px-2 py-2.5 backdrop-blur-md">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                              <span className="text-primary text-[10px] font-black">
                                {globalModuleOffset + idx + 1}
                              </span>
                            </div>
                            <h4 className="text-primary/70 text-sm font-black tracking-widest uppercase">
                              {moduleName}
                            </h4>
                            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                              {permissions.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor={`select-all-${moduleName}`}
                              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-semibold transition-colors">
                              Select All
                            </Label>
                            <Checkbox
                              id={`select-all-${moduleName}`}
                              checked={isAllSelected}
                              onCheckedChange={(checked) =>
                                handleToggleModule(permissions, !!checked)
                              }
                              className={cn(
                                "h-4 w-4 rounded-md",
                                isSomeSelected && !isAllSelected && "bg-primary/20"
                              )}
                            />
                          </div>
                        </div>

                        {/* All actions for this module */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {permissions.map((permission: any) => {
                            const isSelected = selectedPermissions.includes(permission.id);
                            return (
                              <div
                                key={permission.id}
                                onClick={() => handleTogglePermission(permission.id)}
                                className={cn(
                                  "group/item relative flex min-w-0 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:shadow-lg active:scale-[0.97]",
                                  isSelected
                                    ? "bg-primary/4 border-primary/40 ring-primary/10 ring-1"
                                    : "bg-card hover:bg-muted/50 border-border shadow-sm"
                                )}>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1 space-y-1.5">
                                    <p
                                      className={cn(
                                        "truncate font-mono text-[11px] font-bold tracking-tight transition-colors",
                                        isSelected ? "text-primary" : "text-foreground/90"
                                      )}
                                      title={permission.action}>
                                      {permission.action.includes(":")
                                        ? permission.action.split(":")[1].replace(/_/g, " ")
                                        : permission.action.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-muted-foreground line-clamp-2 text-[11px] leading-snug">
                                      {permission.description || "No description provided."}
                                    </p>
                                  </div>
                                  <Checkbox
                                    checked={isSelected}
                                    className="mt-0.5 h-4 w-4 shrink-0 rounded-md transition-all group-hover/item:scale-110"
                                    onCheckedChange={() => {}}
                                  />
                                </div>
                                <div className="mt-2 flex items-center overflow-hidden">
                                  <span className="text-muted-foreground/50 truncate text-[9px] font-black tracking-wider uppercase">
                                    {permission.action}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 border-t border-dashed pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                      className={cn(
                        "h-8 w-8 p-0 text-xs font-bold",
                        currentPage === i && "shadow-md"
                      )}>
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="bg-muted/30 border-t p-6">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="text-muted-foreground hidden text-xs font-medium sm:block">
              {selectedPermissions.length} permissions selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isAssigning}
                className="px-6">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isAssigning || isLoadingPermissions || isLoadingRole}
                className="min-w-[140px] px-8 shadow-sm transition-all hover:shadow-md active:scale-95">
                {isAssigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
