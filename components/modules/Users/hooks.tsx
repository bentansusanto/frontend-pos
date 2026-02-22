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
      role_id: "",
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
        await createUser(values).unwrap();
        toast.success("User created successfully");
        resetForm();
        onSuccess();
      } catch (error: any) {
        console.error("Failed to create user:", error);
        toast.error(error?.data?.message || "Failed to create user");
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
