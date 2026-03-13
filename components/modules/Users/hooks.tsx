import {
  useCreateProfileMutation,
  useUpdateProfileMutation
} from "@/store/services/profile.service";
import { useCreateUserMutation } from "@/store/services/user.service";
import { useFormik } from "formik";
import { toast } from "sonner";
import { ProfileFormValues, profileSchema, UserFormValues, userSchema } from "./schema";

interface UseAddUserProps {
  onSuccess: () => void;
}

export const useAddUser = ({ onSuccess }: UseAddUserProps) => {
  const [createUser, { isLoading }] = useCreateUserMutation();

  const formik = useFormik<UserFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      username: "",
      pin: "",
      role_id: "",
      role_code: "",
      branch_id: ""
    },
    validate: (values) => {
      const result = userSchema.safeParse(values);
      if (result.success) return {};
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return errors;
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Jangan kirim role_code ke API
        const { role_code, ...payload } = values;

        // Jika cashier: kirim pin, hapus username & password
        // Jika non-cashier: kirim username + password, hapus pin
        if (role_code === "cashier") {
          delete payload.username;
          delete payload.password;
        } else {
          delete payload.pin;
        }

        await createUser(payload).unwrap();
        toast.success("User created successfully");
        resetForm();
        onSuccess();
      } catch (error: any) {
        console.error("Failed to create user:", error);
        const msgs = error?.data?.Error;
        let errorMessage = "Failed to create user";
        if (Array.isArray(msgs)) {
          errorMessage = msgs.map((e: any) => e.body).join(", ");
        } else if (msgs?.body) {
          errorMessage = msgs.body;
        } else if (error?.data?.message) {
          errorMessage = error.data.message;
        }
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};


interface UseProfileFormProps {
  userId: string;
  profileId?: string;
  initialValues?: ProfileFormValues;
  onSuccess: () => void;
}

export const useProfileForm = ({
  userId,
  profileId,
  initialValues,
  onSuccess
}: UseProfileFormProps) => {
  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const formik = useFormik<ProfileFormValues>({
    enableReinitialize: true,
    initialValues: initialValues || {
      address: "",
      phone: ""
    },
    validate: (values) => {
      const result = profileSchema.safeParse(values);
      if (result.success) return {};
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (profileId) {
          // Update
          await updateProfile({
            id: profileId,
            body: { ...values, user_id: userId }
          }).unwrap();
          toast.success("Profile updated successfully");
        } else {
          // Create
          await createProfile({ ...values, user_id: userId }).unwrap();
          toast.success("Profile created successfully");
        }
        onSuccess();
      } catch (error: any) {
        console.error("Failed to save profile:", error);
        toast.error(error?.data?.message || "Failed to save profile");
      } finally {
        setSubmitting(false);
      }
    }
  });

  return {
    formik,
    isLoading: isCreating || isUpdating
  };
};
