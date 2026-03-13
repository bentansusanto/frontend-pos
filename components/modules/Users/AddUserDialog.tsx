import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useGetAllRolesQuery } from "@/store/services/user.service";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAddUser } from "./hooks";

export const AddUserDialog = () => {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { formik, isLoading } = useAddUser({
    onSuccess: () => setOpen(false)
  });
  const { data: rolesData } = useGetAllRolesQuery();
  const roles = rolesData || [];

  const { data: branchesData } = useGetBranchesQuery();
  const branches = branchesData || [];

  // Deteksi apakah role yang dipilih adalah cashier
  const selectedRole = roles.find((r: any) => r.id === formik.values.role_id);
  const isCashier = selectedRole?.code === "cashier";

  const handleRoleChange = (value: string) => {
    const role = roles.find((r: any) => r.id === value);
    formik.setFieldValue("role_id", value);
    formik.setFieldValue("role_code", role?.code || "");
    // Reset field yang tidak relevan agar tidak ada sisa nilai
    if (role?.code === "cashier") {
      formik.setFieldValue("username", "");
      formik.setFieldValue("password", "");
    } else {
      formik.setFieldValue("pin", "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 py-4">
          {/* ── Name ── */}
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

          {/* ── Email ── */}
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

          {/* ── Role ── (harus sebelum field kondisional) */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="role_id">Role</Label>
            <Select onValueChange={handleRoleChange} value={formik.values.role_id}>
              <SelectTrigger
                className={
                  formik.touched.role_id && formik.errors.role_id
                    ? "w-full border-red-500"
                    : "w-full"
                }
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role: any) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.role_id && formik.errors.role_id && (
              <div className="text-sm text-red-500">{formik.errors.role_id}</div>
            )}
          </div>

          {/* ── Conditional: PIN (Kasir) atau Username + Password (non-Kasir) ── */}
          {isCashier ? (
            /* ── PIN untuk Kasir ── */
            <div className="flex flex-col gap-2">
              <Label htmlFor="pin">
                PIN Kasir
                <span className="ml-1.5 text-xs text-muted-foreground">(6 digit angka)</span>
              </Label>
              <Input
                id="pin"
                name="pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="Masukkan PIN kasir"
                value={formik.values.pin}
                onChange={(e) => {
                  // Hanya angka
                  const val = e.target.value.replace(/\D/g, "");
                  formik.setFieldValue("pin", val);
                }}
                onBlur={formik.handleBlur}
                className={formik.touched.pin && formik.errors.pin ? "border-red-500" : ""}
              />
              {formik.touched.pin && formik.errors.pin && (
                <div className="text-sm text-red-500">{formik.errors.pin}</div>
              )}
            </div>
          ) : (
            <>
              {/* ── Username untuk non-Kasir ── */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="contoh: john_doe"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.username && formik.errors.username ? "border-red-500" : ""
                  }
                />
                {formik.touched.username && formik.errors.username && (
                  <div className="text-sm text-red-500">{formik.errors.username}</div>
                )}
              </div>

              {/* ── Password untuk non-Kasir ── */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.password && formik.errors.password
                        ? "border-red-500 pr-10"
                        : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="text-sm text-red-500">{formik.errors.password}</div>
                )}
              </div>
            </>
          )}

          {/* ── Branch ── */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch_id">Branch</Label>
            <Select
              onValueChange={(value) => formik.setFieldValue("branch_id", value)}
              value={formik.values.branch_id}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
