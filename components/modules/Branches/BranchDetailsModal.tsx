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
import { Branch } from "./BranchesDataTable";
import { format } from "date-fns";

interface BranchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

export function BranchDetailsModal({ isOpen, onClose, branch }: BranchDetailsModalProps) {
  if (!branch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Branch Details</DialogTitle>
          <DialogDescription>
            Complete information about the selected branch.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Branch Name
              </Label>
              <div className="font-medium text-base">{branch.name}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Branch ID
              </Label>
              <div className="font-mono text-sm text-gray-600 truncate" title={branch.id}>
                {branch.id}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Address
            </Label>
            <div className="text-sm leading-relaxed">{branch.address}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                City
              </Label>
              <div className="text-sm">{branch.city || "-"}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Province
              </Label>
              <div className="text-sm">{branch.province || "-"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Phone
              </Label>
              <div className="text-sm">{branch.phone}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <div className="text-sm">{branch.email || "-"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Created At</Label>
              <div className="text-xs text-gray-500">
                {branch.created_at ? format(new Date(branch.created_at), "PPP p") : "-"}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Last Updated</Label>
              <div className="text-xs text-gray-500">
                {branch.updated_at ? format(new Date(branch.updated_at), "PPP p") : "-"}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
