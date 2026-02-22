import { useGetProfileQuery } from "@/store/services/auth.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useCreateProductStockMutation } from "@/store/services/product-stock.service";
import { useGetProductByIdQuery, useGetProductsQuery } from "@/store/services/product.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { addStockSchema, AddStockValues } from "./schema";

export const useAddStock = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const [createProductStock, { isLoading }] = useCreateProductStockMutation();
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery();
  const { data: branchesData, isLoading: isBranchesLoading } = useGetBranchesQuery();
  const { data: profileData } = useGetProfileQuery();

  const [variants, setVariants] = useState<any[]>([]);

  const userRole = profileData?.data?.role;
  const userBranches = profileData?.data?.branches || [];

  const availableBranches = useMemo(() => {
    if (!branchesData?.data) return [];
    if (userRole === "owner" || userRole === "super_admin") {
      return branchesData.data;
    }
    // Filter branches based on user's assigned branches
    return branchesData.data.filter((branch: any) =>
      userBranches.some((ub: any) => ub.id === branch.id)
    );
  }, [branchesData, userRole, userBranches]);

  const form = useForm<AddStockValues>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      branchId: "",
      productId: "",
      variantId: "",
      stock: 1,
      minStock: 0
    }
  });

  // Auto-select branch if user has only one assigned branch
  useEffect(() => {
    if (availableBranches.length === 1) {
      form.setValue("branchId", availableBranches[0].id);
    }
  }, [availableBranches, form]);

  const selectedProductId = form.watch("productId");
  const selectedBranchId = form.watch("branchId");

  const { data: productDetailData, isLoading: isProductDetailLoading } = useGetProductByIdQuery(
    { id: selectedProductId, branch_id: selectedBranchId },
    { skip: !selectedProductId }
  );

  useEffect(() => {
    if (selectedProductId && productDetailData?.data?.variants) {
      setVariants(productDetailData.data.variants);
    } else {
      setVariants([]);
    }
  }, [selectedProductId, productDetailData]);

  // Reset variant selection when product changes
  useEffect(() => {
    form.setValue("variantId", "");
  }, [selectedProductId, form]);

  const onSubmit = async (values: AddStockValues) => {
    try {
      const payload: any = {
        branchId: values.branchId,
        productId: values.productId,
        stock: values.stock,
        minStock: values.minStock
      };

      if (values.variantId) {
        payload.variantId = values.variantId;
      }

      await createProductStock(payload).unwrap();

      toast.success("Stock added successfully");
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to add stock");
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
    products: productsData?.data || [],
    isProductsLoading,
    branches: availableBranches,
    isBranchesLoading,
    variants,
    isProductDetailLoading
  };
};
