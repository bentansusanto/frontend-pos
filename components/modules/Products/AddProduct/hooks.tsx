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
import { useCreateProductStockMutation } from "@/store/services/product-stock.service";

import { getCookie } from "@/utils/cookies";
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
  const [createProductStock, { isLoading: isCreatingStock }] = useCreateProductStockMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const categories = categoriesData ?? [];

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
        imageFiles: [],
        id: ""
      },
      variants: [
        {
          name_variant: "Default",
          sku: "",
          price: 0,
          cost_price: 0,
          stock: 0,
          batch_code: "",
          barcode: ""
        }
      ]
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

        if (values.product.thumbnailFile) {
          formData.append("thumbnail", values.product.thumbnailFile);
        }

        if (values.product.imageFiles && values.product.imageFiles.length > 0) {
          values.product.imageFiles.forEach((file: any) => {
            formData.append("images", file);
          });
        }

        let productId = values.product.id;
        const productName = values.product.name_product;

        if (!productId) {
          const productResponse = await createProduct(formData).unwrap();
          productId = (productResponse as any)?.data?.id || (productResponse as any)?.id;
          
          if (!productId || typeof productId !== "string") {
            throw new Error(`Product ID not returned correctly. Got: ${typeof productId}`);
          }
          
          void formik.setFieldValue("product.id", productId);
          toast.info("Product created, setting up variants...");
        } else {
          toast.info("Product exists, resuming variant configuration...");
        }

        const branchId = getCookie("pos_branch_id");
        if (!branchId) {
          toast.warning("Branch ID not found. Stock will not be initialized.");
        }

        for (const [index, variant] of values.variants.entries()) {
          const variantResponse = await createVariantProduct({
            productId: String(productId),
            name_variant: variant.name_variant,
            price: variant.price,
            cost_price: variant.cost_price,
            barcode: variant.barcode
          }).unwrap();

          const variantId = (variantResponse as any)?.data?.id || (variantResponse as any)?.id;

          if (variantId && branchId && variant.stock >= 0) {
            await createProductStock({
              productId: String(productId),
              variantId: String(variantId),
              branchId: String(branchId),
              stock: variant.stock,
              minStock: 0
            }).unwrap();
          }
          
          if (values.variants.length > 1) {
             toast.info(`Configured variant ${index + 1} of ${values.variants.length}...`);
          }
        }

        toast.success("Product, variants, and stock created successfully");
        setCurrentStep(1);
        resetForm();
      } catch (error: any) {
        const errorData = (error as any)?.data;
        let errorMessage = errorData?.Error?.body || errorData?.message || error?.message || "Failed to create product";
        
        if (errorMessage.includes("unique constraint") || errorMessage.includes("already exists")) {
          if (errorMessage.includes("slug") || errorMessage.includes("name_product")) {
             errorMessage = "Product name already exists.";
          } else if (errorMessage.includes("sku")) {
             errorMessage = "SKU already exists.";
          }
        }
        
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
    isSubmitting: isSubmitting || isCreatingProduct || isCreatingVariant || isCreatingStock,
    isCreatingCategory,
    handleCreateCategory,
    currentStep,
    setCurrentStep
  };
};
