"use client";

import { useFormik } from "formik";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useGetAllCategoriesQuery } from "@/store/services/category.service";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUpdateVariantProductMutation
} from "@/store/services/product.service";

import { updateProductSchema, UpdateProductSchema } from "./schema";

type UpdateProductFormValues = UpdateProductSchema & {
  product_id: string;
  variant_id: string;
};

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

export const HooksUpdateProduct = () => {
  const params = useParams<{ productId: string }>();
  const productId = params?.productId;
  const { data: productData } = useGetProductByIdQuery(productId ?? "", {
    skip: !productId
  });
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();
  const [updateVariantProduct, { isLoading: isUpdatingVariant }] =
    useUpdateVariantProductMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = (productData as any)?.data;
  const categories = (categoriesData as any)?.data ?? [];

  const initialValues = useMemo<UpdateProductFormValues>(
    () => ({
      product_id: productId ?? "",
      variant_id: product?.variants?.[0]?.id ?? "",
      product: {
        name_product: product?.name_product ?? "",
        description: product?.description ?? "",
        category_id: product?.category_id ?? "",
        price: product?.price ? String(product.price) : "",
        thumbnail: product?.thumbnail ?? "",
        images: Array.isArray(product?.images) ? product.images.join(", ") : "",
        thumbnailFile: undefined,
        imageFiles: []
      },
      variant: {
        productId: productId ?? "",
        name_variant: product?.variants?.[0]?.name_variant ?? "",
        price: product?.variants?.[0]?.price ? String(product.variants[0].price) : "",
        weight: product?.variants?.[0]?.weight ? String(product.variants[0].weight) : "",
        color: product?.variants?.[0]?.color ?? "",
        thumbnail: product?.variants?.[0]?.thumbnail ?? "",
        thumbnailFile: undefined
      }
    }),
    [product, productId]
  );

  const formik = useFormik<UpdateProductFormValues>({
    initialValues,
    enableReinitialize: true,
    validate: (values) => {
      const result = updateProductSchema.safeParse(values);
      if (!result.success) {
        return buildFormikErrors(result.error.issues);
      }
      return {};
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const productFormData = new FormData();
        productFormData.append("name_product", values.product.name_product);
        productFormData.append("category_id", values.product.category_id);
        productFormData.append("description", values.product.description);

        if (values.product.price) {
          productFormData.append("price", String(values.product.price));
        }

        if (values.product.thumbnailFile) {
          productFormData.append("thumbnail", values.product.thumbnailFile);
        }

        if (values.product.imageFiles && values.product.imageFiles.length > 0) {
          values.product.imageFiles.forEach((file: any) => {
            productFormData.append("images", file);
          });
        }

        await updateProduct({ id: values.product_id, body: productFormData }).unwrap();

        toast.success("Product updated successfully");
      } catch (error: any) {
        const errorMessage =
          (error as any)?.data?.Error?.body ||
          (error as any)?.data?.message ||
          error?.message ||
          "Failed to update product";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  return {
    formik,
    categories,
    isCategoriesLoading,
    isSubmitting: isSubmitting || isUpdatingProduct
  };
};
