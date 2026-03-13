"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useCreateProfileMutation,
  useUpdateProfileMutation
} from "@/store/services/profile.service";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/store/services/user.service";
import { useFormik } from "formik";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export function UserDetailsModal({ isOpen, onClose, userId }: UserDetailsModalProps) {
  const { data: user, isLoading, refetch } = useGetUserByIdQuery(userId as string, {
    skip: !userId
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-[90vh] overflow-y-auto p-0 gap-0">
        <DialogTitle className="sr-only">User Details</DialogTitle>
        <DialogDescription className="sr-only">View and edit user details.</DialogDescription>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : !user ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">User not found.</p>
          </div>
        ) : (
          <div className="space-y-6 bg-background">
            {/* ── Hero Profile Section ── */}
            <div className="bg-card text-card-foreground relative overflow-hidden border-b shadow-sm">
              <div className="from-primary/10 via-primary/5 absolute inset-x-0 top-0 h-32 bg-gradient-to-br to-transparent" />

              <div className="relative flex flex-col items-start gap-6 px-8 pt-12 pb-6 sm:flex-row sm:items-end">
                <div className="ring-background flex-shrink-0 rounded-full ring-4">
                  <Avatar className="h-24 w-24 text-3xl shadow-md sm:h-28 sm:w-28 sm:text-4xl">
                    <AvatarFallback className="bg-primary/10 font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{user?.name}</h1>
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-0.5 font-medium",
                        user.is_verified
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-yellow-200 bg-yellow-50 text-yellow-700"
                      )}>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          user.is_verified ? "bg-green-500" : "bg-yellow-400"
                        )}
                      />
                      {user.is_verified ? "Verified" : "Pending"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 capitalize">
                      {user.role}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </div>
                    {user.profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {user.profile.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-8">
              {/* ── Content Tabs ── */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-muted/50 mb-6 w-full justify-start rounded-lg p-1">
                  <TabsTrigger value="overview" className="w-full sm:w-auto">
                    Overview & Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="w-full sm:w-auto">
                    Security & Access
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Overview */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="flex flex-col gap-6">
                    {/* Account Information */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User2 className="text-primary/70 h-5 w-5" />
                          Account Details
                        </CardTitle>
                        <CardDescription>System identifiers and branch assignments.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-muted-foreground text-sm font-medium">Username</span>
                          <span className="col-span-2 text-sm">
                            {user.username || <span className="text-muted-foreground italic">Not set</span>}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="text-muted-foreground text-sm font-medium">User ID</span>
                          <span className="col-span-2 font-mono text-sm">{user.id}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 pt-2">
                          <span className="text-muted-foreground text-sm font-medium">Branch</span>
                          <div className="col-span-2 flex flex-wrap gap-1.5">
                            {user.branches?.length > 0 ? (
                              user.branches.map((b: any) => (
                                <Badge key={b.id} variant="outline" className="font-normal">
                                  {b.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm italic">
                                No branch assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Profile Form */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ShieldCheck className="text-primary/70 h-5 w-5" />
                          Personal Profile
                        </CardTitle>
                        <CardDescription>Update contact information.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <UpdateProfileForm
                          userId={userId as string}
                          profileId={user.profile?.id}
                          initialValues={user.profile}
                          onSuccess={refetch}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab 2: Security */}
                <TabsContent value="security" className="space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <KeyRound className="text-primary/70 h-5 w-5" />
                        {user.role_code === "cashier" ? "Cashier PIN Access" : "Login Credentials"}
                      </CardTitle>
                      <CardDescription>
                        {user.role_code === "cashier"
                          ? "Manage the 4-8 digit numeric PIN used for POS access."
                          : "Update system username and password for this account."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user.role_code === "cashier" ? (
                        <UpdatePinForm userId={userId as string} currentPin={user.pin} onSuccess={refetch} />
                      ) : (
                        <UpdateCredentialsForm
                          userId={userId as string}
                          currentUsername={user.username}
                          onSuccess={refetch}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// Sub-form: Update PIN (cashier)
// ─────────────────────────────────────────────
function UpdatePinForm({
  userId,
  currentPin,
  onSuccess
}: {
  userId: string;
  currentPin?: string | null;
  onSuccess: () => void;
}) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const formik = useFormik({
    initialValues: { pin: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.pin) errors.pin = "PIN wajib diisi";
      else if (!/^\d{4,8}$/.test(values.pin)) errors.pin = "PIN harus 4–8 digit angka";
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await updateUser({ id: userId, data: { pin: values.pin } }).unwrap();
        toast.success(res?.message || "Success update user");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message || "Gagal memperbarui PIN");
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {currentPin && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          PIN sudah di-set
        </p>
      )}
      <div className="max-w-xs space-y-1.5">
        <Label htmlFor="pin">
          {currentPin ? "Ganti PIN" : "Set PIN"}
          <span className="text-muted-foreground ml-1.5 text-xs">(4–8 digit angka)</span>
        </Label>
        <Input
          id="pin"
          type="password"
          inputMode="numeric"
          maxLength={8}
          placeholder="••••••"
          value={formik.values.pin}
          onChange={(e) => formik.setFieldValue("pin", e.target.value.replace(/\D/g, ""))}
          onBlur={formik.handleBlur}
          className={formik.touched.pin && formik.errors.pin ? "border-red-500" : ""}
        />
        {formik.touched.pin && formik.errors.pin && (
          <p className="text-xs text-red-500">{formik.errors.pin}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading} size="sm">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Simpan PIN
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────
// Sub-form: Update Username + Password (non-cashier)
// ─────────────────────────────────────────────
function UpdateCredentialsForm({
  userId,
  currentUsername,
  onSuccess
}: {
  userId: string;
  currentUsername?: string | null;
  onSuccess: () => void;
}) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: currentUsername || "",
      password: "",
      confirmPassword: ""
    },
    enableReinitialize: true,
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.username || values.username.trim() === "") {
        errors.username = "Username wajib diisi";
      }
      if (values.password) {
        if (values.password.length < 8) errors.password = "Password minimal 8 karakter";
        else if (!/(?=.*[a-z])/.test(values.password))
          errors.password = "Harus mengandung huruf kecil";
        else if (!/(?=.*[A-Z])/.test(values.password))
          errors.password = "Harus mengandung huruf kapital";
        else if (!/(?=.*\d)/.test(values.password)) errors.password = "Harus mengandung angka";
        else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(values.password))
          errors.password = "Harus mengandung karakter spesial";

        if (values.confirmPassword !== values.password)
          errors.confirmPassword = "Password tidak sama";
      }
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload: any = { username: values.username };
        if (values.password) payload.password = values.password;

        const res = await updateUser({ id: userId, data: payload }).unwrap();
        toast.success(res?.message || "Success update user");
        resetForm({ values: { username: values.username, password: "", confirmPassword: "" } });
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message || "Gagal memperbarui kredensial");
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="cred-username">Username</Label>
        <Input
          id="cred-username"
          type="text"
          placeholder="contoh: john_doe"
          {...formik.getFieldProps("username")}
          className={formik.touched.username && formik.errors.username ? "border-red-500" : ""}
        />
        {formik.touched.username && formik.errors.username && (
          <p className="text-xs text-red-500">{formik.errors.username}</p>
        )}
      </div>

      <div className="border-t pt-4">
        <p className="text-muted-foreground mb-3 text-sm">
          Isi kolom di bawah hanya jika ingin mengganti password:
        </p>
        <div className="space-y-3">
          <div className="max-w-sm space-y-1.5">
            <Label htmlFor="cred-password">Password Baru</Label>
            <div className="relative">
              <Input
                id="cred-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...formik.getFieldProps("password")}
                className={cn(
                  "pr-10",
                  formik.touched.password && formik.errors.password ? "border-red-500" : ""
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500">{formik.errors.password}</p>
            )}
          </div>
          <div className="max-w-sm space-y-1.5">
            <Label htmlFor="cred-confirm">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="cred-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                {...formik.getFieldProps("confirmPassword")}
                className={cn(
                  "pr-10",
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? "border-red-500"
                    : ""
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-xs text-red-500">{formik.errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} size="sm">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Simpan Perubahan
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────
// Sub-form: Update Profile
// ─────────────────────────────────────────────
function UpdateProfileForm({
  userId,
  profileId,
  initialValues,
  onSuccess
}: {
  userId: string;
  profileId?: string;
  initialValues?: { address: string; phone: string } | null;
  onSuccess: () => void;
}) {
  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const isLoading = isCreating || isUpdating;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      address: initialValues?.address || "",
      phone: initialValues?.phone || ""
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.address.trim()) errors.address = "Alamat wajib diisi";
      if (!values.phone.trim()) errors.phone = "Nomor telepon wajib diisi";
      return errors;
    },
    onSubmit: async (values) => {
      try {
        if (profileId) {
          await updateProfile({ id: profileId, body: { ...values, user_id: userId } }).unwrap();
        } else {
          await createProfile({ ...values, user_id: userId }).unwrap();
        }
        toast.success("Profile berhasil diperbarui");
        onSuccess();
      } catch (err: any) {
        toast.error(err?.data?.message || "Gagal memperbarui profile");
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="prof-address">Alamat</Label>
          <Input
            id="prof-address"
            placeholder="Jl. Contoh No. 1"
            {...formik.getFieldProps("address")}
            className={formik.touched.address && formik.errors.address ? "border-red-500" : ""}
          />
          {formik.touched.address && formik.errors.address && (
           <p className="text-xs text-red-500">{formik.errors.address}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prof-phone">No. Telepon</Label>
          <Input
            id="prof-phone"
            type="tel"
            placeholder="08xxxxxxxxxx"
            {...formik.getFieldProps("phone")}
            className={formik.touched.phone && formik.errors.phone ? "border-red-500" : ""}
          />
          {formik.touched.phone && formik.errors.phone && (
            <p className="text-xs text-red-500">{formik.errors.phone}</p>
          )}
        </div>
      </div>
      <Button type="submit" disabled={isLoading} size="sm">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {profileId ? "Simpan Profile" : "Buat Profile"}
      </Button>
    </form>
  );
}
