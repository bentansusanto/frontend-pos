import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { useCreateVariantProductMutation } from "@/store/services/product.service";

import { addVariantSchema, AddVariantSchema } from "./schema";

interface UseAddVariantProps {
  productId: string;
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

export const useAddVariant = ({ productId, onSuccess }: UseAddVariantProps) => {
  const [createVariantProduct, { isLoading }] = useCreateVariantProductMutation();

  const formik = useFormik<AddVariantSchema>({
    initialValues: {
      name_variant: "",
      price: 0,
      weight: undefined,
      color: "",
      thumbnail: "",
      thumbnailFile: undefined
    },
    validate: (values) => {
      const result = addVariantSchema.safeParse(values);
      if (!result.success) {
        return buildFormikErrors(result.error.issues);
      }
      return {};
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("name_variant", values.name_variant);
        formData.append("price", String(values.price));
        
        if (values.weight) {
          formData.append("weight", String(values.weight));
        }
        
        if (values.color) {
          formData.append("color", values.color);
        }

        if (values.thumbnailFile) {
          formData.append("thumbnail", values.thumbnailFile);
        } else if (values.thumbnail) {
          formData.append("thumbnail", values.thumbnail);
        }

        await createVariantProduct(formData).unwrap();

        toast.success("Variant created successfully");
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error: any) {
        const errorMessage =
          (error as any)?.data?.Error?.body ||
          (error as any)?.data?.message ||
          error?.message ||
          "Failed to create variant";
        toast.error(errorMessage);
      }
    }
  });

  return {
    formik,
    isLoading
  };
};
