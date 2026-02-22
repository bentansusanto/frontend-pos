import { useFormik } from "formik";
import { toast } from "sonner";

import { useUpdateVariantProductMutation } from "@/store/services/product.service";

import { updateVariantSchema, UpdateVariantSchema } from "./schema";

interface UseUpdateVariantProps {
  variantId: string;
  productId: string;
  initialData: any;
  onSuccess?: () => void;
}

const buildFormikErrors = (issues: Array<{ path: Array<string | number>; message: string }>) => {
  const errors: Record<string, any> = {};
  issues.forEach((issue) => {
    if (!issue.path.length) {
      return;
    }
    const key = String(issue.path[0]);
    errors[key] = issue.message;
  });
  return errors;
};

export const useUpdateVariant = ({
  variantId,
  productId,
  initialData,
  onSuccess
}: UseUpdateVariantProps) => {
  const [updateVariantProduct, { isLoading }] = useUpdateVariantProductMutation();

  const formik = useFormik<UpdateVariantSchema>({
    initialValues: {
      name_variant: initialData?.name_variant || "",
      price: initialData?.price ? parseFloat(initialData.price) : 0,
      weight: initialData?.weight ? parseFloat(initialData.weight) : undefined,
      color: initialData?.color || "",
      thumbnail: initialData?.thumbnail || "",
      thumbnailFile: undefined
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = updateVariantSchema.safeParse(values);
      if (!result.success) {
        return buildFormikErrors(result.error.issues);
      }
      return {};
    },
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("name_variant", values.name_variant);
        formData.append("price", String(isNaN(values.price) ? 0 : values.price));

        if (values.weight !== undefined) {
          formData.append("weight", String(isNaN(values.weight!) ? 0 : values.weight));
        }

        if (values.color) {
          formData.append("color", values.color);
        }

        if (values.thumbnailFile) {
          formData.append("thumbnail", values.thumbnailFile);
        }

        await updateVariantProduct({ id: variantId, body: formData }).unwrap();

        toast.success("Variant updated successfully");
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        const errorMessage =
          (error as any)?.data?.Error?.body ||
          (error as any)?.data?.message ||
          error?.message ||
          "Failed to update variant";
        toast.error(errorMessage);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};
