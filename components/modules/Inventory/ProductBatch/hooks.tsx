import { useGetProfileQuery } from "@/store/services/auth.service";
import { useGetBranchesQuery } from "@/store/services/branch.service";
import { useCreateProductBatchMutation } from "@/store/services/product-batch.service";
import { useGetProductByIdQuery, useGetProductsQuery } from "@/store/services/product.service";
import { useGetSuppliersQuery } from "@/store/services/supplier.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createBatchSchema, CreateBatchValues } from "./schema";

export const useCreateBatch = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const [createProductBatch, { isLoading: isCreating }] = useCreateProductBatchMutation();
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery();
  const { data: branchesData, isLoading: isBranchesLoading } = useGetBranchesQuery();
  const { data: suppliersData, isLoading: isSuppliersLoading } = useGetSuppliersQuery();
  const { data: profileData } = useGetProfileQuery();

  const [variants, setVariants] = useState<any[]>([]);

  const userRole = profileData?.role;
  const userBranches = profileData?.branches || [];

  const availableBranches = useMemo(() => {
    if (!branchesData) return [];
    if (userRole === "owner" || userRole === "super_admin") {
      return branchesData;
    }
    return branchesData.filter((branch: any) =>
      userBranches.some((ub: any) => ub.id === branch.id)
    );
  }, [branchesData, userRole, userBranches]);

  const form = useForm<CreateBatchValues>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: {
      batchNumber: "",
      branchId: "",
      productId: "",
      productVariantId: "",
      supplierId: "",
      initialQuantity: 1,
      costPrice: 0,
      status: "active",
      receivedDate: new Date()
    }
  });

  const selectedProductId = form.watch("productId");
  const selectedBranchId = form.watch("branchId");

  const { data: productDetailData, isLoading: isProductDetailLoading } = useGetProductByIdQuery(
    { id: selectedProductId, branch_id: selectedBranchId },
    { skip: !selectedProductId }
  );

  useEffect(() => {
    if (selectedProductId && productDetailData?.variants) {
      setVariants(productDetailData.variants);
    } else {
      setVariants([]);
    }
  }, [selectedProductId, productDetailData]);

  useEffect(() => {
    if (availableBranches.length === 1) {
      form.setValue("branchId", availableBranches[0].id);
    }
  }, [availableBranches, form]);

  const onSubmit = async (values: CreateBatchValues) => {
    try {
      await createProductBatch(values).unwrap();
      toast.success("Product batch created successfully");
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create batch");
    }
  };

  return {
    form,
    onSubmit,
    isLoading: isCreating || isProductsLoading || isBranchesLoading || isSuppliersLoading,
    isProductDetailLoading,
    products: productsData || [],
    branches: availableBranches,
    suppliers: suppliersData || [],
    variants
  };
};
