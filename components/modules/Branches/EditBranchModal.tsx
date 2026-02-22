import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateBranch } from "./hooks";
import { Branch } from "./BranchesDataTable";

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

export const EditBranchModal = ({ isOpen, onClose, branch }: EditBranchModalProps) => {
  const { formik, isLoading } = useUpdateBranch({
    onSuccess: () => {
      onClose();
    },
    initialData: branch ? {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: (branch as any).email || "", // Assuming email might be available in Branch type or updated
      city: (branch as any).city || "",
      province: (branch as any).province || ""
    } : undefined
  });

  if (!branch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-sm text-red-500">{formik.errors.name}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.address && formik.errors.address ? "border-red-500" : ""}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-sm text-red-500">{formik.errors.address}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.phone && formik.errors.phone ? "border-red-500" : ""}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-sm text-red-500">{formik.errors.phone}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-sm text-red-500">{formik.errors.email}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.city && formik.errors.city ? "border-red-500" : ""}
            />
            {formik.touched.city && formik.errors.city && (
              <div className="text-sm text-red-500">{formik.errors.city}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="province">Province</Label>
            <Input
              id="province"
              name="province"
              value={formik.values.province}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.province && formik.errors.province ? "border-red-500" : ""}
            />
            {formik.touched.province && formik.errors.province && (
              <div className="text-sm text-red-500">{formik.errors.province}</div>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Branch"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
