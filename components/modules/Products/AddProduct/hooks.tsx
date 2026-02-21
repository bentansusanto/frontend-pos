"use client";

import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";

import {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery
} from "@/store/services/category.service";
import {
  useCreateProductMutation,
  useCreateVariantProductMutation
} from "@/store/services/product.service";

import { addProductSchema, AddProductSchema } from "./schema";

const buildFormikErrors = (issues: Array<{ path: Array<string | number>; message: string }>) => {
  const errors: Record<string, any> = {};
  issues.forEach((issue) => {
    if (!issue.path.length) {
      return;
    }
    let current = errors;
    issue.path.forEach((segment, index) => {
      const key = String(segment);
      if (index === issue.path.length - 1) {
        current[key] = issue.message;
      } else {
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
    });
  });
  return errors;
};

export const HooksAddProduct = () => {
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories
  } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [createVariantProduct, { isLoading: isCreatingVariant }] =
    useCreateVariantProductMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = (categoriesData as any)?.data ?? [];

  const formik = useFormik<AddProductSchema>({
    initialValues: {
      product: {
        name_product: "",
        description: "",
        category_id: "",
        price: "",
        thumbnail: "",
        images: "",
        thumbnailFile: undefined,
        imageFiles: []
      },
      variant: {
        productId: "",
        name_variant: "",
        price: "",
        weight: "",
        color: "",
        thumbnail: "",
        thumbnailFile: undefined
      }
    },
    validate: (values) => {
      const result = addProductSchema.safeParse(values);
      if (!result.success) {
        return buildFormikErrors(result.error.issues);
      }
      return {};
    },
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("name_product", values.product.name_product);
        formData.append("category_id", values.product.category_id);
        formData.append("description", values.product.description);

        if (values.product.price) {
          formData.append("price", String(values.product.price));
        }

        if (values.product.thumbnailFile) {
          formData.append("thumbnail", values.product.thumbnailFile);
        }

        if (values.product.imageFiles && values.product.imageFiles.length > 0) {
          values.product.imageFiles.forEach((file: any) => {
            formData.append("images", file);
          });
        }

        const productResponse = await createProduct(formData).unwrap();
        const productId = (productResponse as any)?.data?.id;

        if (!productId) {
          throw new Error("Product ID not returned");
        }

        const variantFormData = new FormData();
        variantFormData.append("productId", productId);
        variantFormData.append("name_variant", values.variant.name_variant);
        variantFormData.append("price", String(values.variant.price));
        variantFormData.append("weight", String(values.variant.weight));
        variantFormData.append("color", values.variant.color);

        if (values.variant.thumbnailFile) {
          variantFormData.append("thumbnail", values.variant.thumbnailFile);
        } else if (values.variant.thumbnail) {
          variantFormData.append("thumbnail", values.variant.thumbnail);
        }

        await createVariantProduct(variantFormData).unwrap();

        toast.success("Product created successfully");
        resetForm();
      } catch (error: any) {
        const errorMessage =
          (error as any)?.data?.Error?.body ||
          (error as any)?.data?.message ||
          error?.message ||
          "Failed to create product";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleCreateCategory = async (name: string) => {
    try {
      await createCategory({ name }).unwrap();
      await refetchCategories();
      toast.success("Category created successfully");
    } catch (error: any) {
      const errorMessage =
        (error as any)?.data?.Error?.body ||
        (error as any)?.data?.message ||
        error?.message ||
        "Failed to create category";
      toast.error(errorMessage);
    }
  };

  return {
    formik,
    categories,
    isCategoriesLoading,
    isSubmitting: isSubmitting || isCreatingProduct || isCreatingVariant,
    isCreatingCategory,
    handleCreateCategory
  };
};
