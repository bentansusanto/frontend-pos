"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Settings2,
  Trash2,
  Save,
  Globe,
  Store,
  ChevronRight,
  Gift,
} from "lucide-react";
import {
  useGetLoyaltySettingsQuery,
  useCreateLoyaltySettingMutation,
  useUpdateLoyaltySettingMutation,
  useDeleteLoyaltySettingMutation,
} from "@/store/services/loyalty-settings.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";

export default function LoyaltySettingsPage() {
  const { data: settings = [], isLoading: isLoadingSettings } = useGetLoyaltySettingsQuery();
  const { data: branchesData } = useGetBranchesQuery();
  const branches = branchesData || [];

  const [createSetting] = useCreateLoyaltySettingMutation();
  const [updateSetting] = useUpdateLoyaltySettingMutation();
  const [deleteSetting] = useDeleteLoyaltySettingMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({
    branchId: "global",
    minimumSpend: 0,
    amountPerPoint: 10,
    pointsEarned: 1,
    isActive: true,
  });

  const handleCreate = async () => {
    try {
      const payload = {
        ...newSetting,
        branchId: newSetting.branchId === "global" ? null : newSetting.branchId,
      };
      await createSetting(payload).unwrap();
      toast.success("Loyalty setting created efficiently");
      setIsCreateModalOpen(false);
      setNewSetting({
        branchId: "global",
        minimumSpend: 0,
        amountPerPoint: 10,
        pointsEarned: 1,
        isActive: true,
      });
    } catch (error) {
      toast.error("Failed to create setting");
    }
  };

  const handleUpdate = async (id: string, body: any) => {
    try {
      await updateSetting({ id, body }).unwrap();
      toast.success("Setting updated");
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSetting(id).unwrap();
      toast.success("Setting removed");
    } catch (error) {
      toast.error("Failed to delete setting");
    }
  };

  if (isLoadingSettings) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  const globalSetting = settings.find((s: any) => s.branchId === null);
  const branchSettings = settings.filter((s: any) => s.branchId !== null);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Loyalty Program</h1>
          <p className="text-sm text-muted-foreground">
            Configure how customers earn points across your branches.
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Branch Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Loyalty Rule</DialogTitle>
              <DialogDescription>
                Set specific loyalty earnings for a particular branch.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Branch Target</Label>
                <Select
                  value={newSetting.branchId}
                  onValueChange={(v) => setNewSetting({ ...newSetting, branchId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (System Default)</SelectItem>
                    {branches.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Min. Spend ($)</Label>
                  <Input
                    type="number"
                    value={newSetting.minimumSpend}
                    onChange={(e) => setNewSetting({ ...newSetting, minimumSpend: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Points Earned</Label>
                  <Input
                    type="number"
                    value={newSetting.pointsEarned}
                    onChange={(e) => setNewSetting({ ...newSetting, pointsEarned: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Amount per Point ($ Ratio)</Label>
                <Input
                  type="number"
                  value={newSetting.amountPerPoint}
                  onChange={(e) => setNewSetting({ ...newSetting, amountPerPoint: Number(e.target.value) })}
                  placeholder="e.g. 10 for $10 = 1 point"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Config Card */}
      {globalSetting && (
        <Card className="border-primary/20 bg-primary/5 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Global Default Rule</CardTitle>
                  <CardDescription>Applied to all branches unless overridden.</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="global-active" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Active</Label>
                  <Switch
                    id="global-active"
                    checked={globalSetting.isActive}
                    onCheckedChange={(val) => handleUpdate(globalSetting.id, { isActive: val })}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Minimum Spend</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono">$</span>
                  <Input
                    type="number"
                    className="font-bold text-lg"
                    defaultValue={globalSetting.minimumSpend}
                    onBlur={(e) => handleUpdate(globalSetting.id, { minimumSpend: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">Point Ratio</Label>
                <div className="flex items-center gap-3">
                   <div className="flex-1 flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      defaultValue={globalSetting.amountPerPoint}
                      onBlur={(e) => handleUpdate(globalSetting.id, { amountPerPoint: Number(e.target.value) })}
                    />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      defaultValue={globalSetting.pointsEarned}
                      onBlur={(e) => handleUpdate(globalSetting.id, { pointsEarned: Number(e.target.value) })}
                    />
                    <span className="text-muted-foreground text-sm">Pts</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-end">
                <Badge variant="outline" className="h-10 px-4 bg-background border-primary/30 text-primary font-bold gap-2">
                  <Gift className="h-4 w-4" />
                  Every ${globalSetting.amountPerPoint} = {globalSetting.pointsEarned} Pts
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branch Overrides */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-bold">Branch Overrides</h2>
        </div>
        
        <Card className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Branch</TableHead>
                <TableHead>Minimum Spend</TableHead>
                <TableHead>Ratio ($ → Pts)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branchSettings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No branch-specific rules defined. All branches currently follow the Global Rule.
                  </TableCell>
                </TableRow>
              ) : (
                branchSettings.map((s: any) => {
                  const branchName = branches.find((b: any) => b.id === s.branchId)?.name || s.branchId;
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Store className="h-3.5 w-3.5 text-muted-foreground" />
                        {branchName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">$</span>
                          <input
                            type="number"
                            className="w-16 bg-transparent border-none p-0 focus:ring-0 font-medium"
                            defaultValue={s.minimumSpend}
                            onBlur={(e) => handleUpdate(s.id, { minimumSpend: Number(e.target.value) })}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="number"
                            className="w-12 bg-muted/50 rounded px-1 py-0.5 border-none focus:ring-1"
                            defaultValue={s.amountPerPoint}
                            onBlur={(e) => handleUpdate(s.id, { amountPerPoint: Number(e.target.value) })}
                          />
                          <span>$ = </span>
                          <input
                            type="number"
                            className="w-12 bg-muted/50 rounded px-1 py-0.5 border-none focus:ring-1"
                            defaultValue={s.pointsEarned}
                            onBlur={(e) => handleUpdate(s.id, { pointsEarned: Number(e.target.value) })}
                          />
                          <span>Pts</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={s.isActive}
                          onCheckedChange={(val) => handleUpdate(s.id, { isActive: val })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this loyalty rule for the branch.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(s.id)} 
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="flex items-start gap-4 rounded-xl bg-orange-50 p-4 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30">
        <Settings2 className="mt-1 h-5 w-5 text-orange-600 dark:text-orange-400" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-orange-700 dark:text-orange-400">Pro Tip: Point Calculation Base</p>
          <p className="text-xs text-orange-600/80 dark:text-orange-400/60 leading-relaxed">
            Points are calculated based on the <b>Subtotal</b> (before tax and discounts). 
            If a branch override is enabled, the system ignores the Global Rule for that specific location.
          </p>
        </div>
      </div>
    </div>
  );
}
