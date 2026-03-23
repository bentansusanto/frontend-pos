"use client";

import { ChevronDown, CreditCard, Mail, Minus, Package, Phone, Plus, Search, Trash2, User, UserRoundPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useGetProfileQuery } from "@/store/services/auth.service";
import { useGetAllCategoriesQuery } from "@/store/services/category.service";
import { useGetAllCustomersQuery } from "@/store/services/customer.service";
import { useGetPromotionsQuery } from "@/store/services/promotion.service";
import {
  useCreateOrderMutation,
  useDeleteOrderItemMutation,
  useGetOrdersQuery,
  useUpdateOrderMutation,
  useUpdateOrderQuantityMutation
} from "@/store/services/order.service";
import {
  useCreatePaymentMutation,
  useVerifyPaymentMutation
} from "@/store/services/payment.service";
import { useGetProductsQuery, useGetVariantProductsQuery } from "@/store/services/product.service";
import { useGetActiveTaxesQuery } from "@/store/services/tax.service";
import { useCheckBranchFrozenQuery } from "@/store/services/stock-take.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCookie } from "@/utils/cookies";
import { toast } from "sonner";
import { useCustomerForm } from "../Customers/hooks";
import { usePosOrder } from "./hooks";
import { ReceiptModal } from "./ReceiptModal";
import { StripePayment } from "./StripePayment";
import { OpenSessionModal } from "./OpenSessionModal";
import { CloseSessionModal } from "./CloseSessionModal";
import { useGetActiveSessionQuery } from "@/store/services/pos-session.service";
import { Lock, AlertTriangle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export const PosPage = () => {
  const router = useRouter();
  const { data: profileData } = useGetProfileQuery();
  const userRole = profileData?.role;

  useEffect(() => {
    if (userRole && userRole !== "cashier") {
      router.push("/access-denied");
    }
  }, [userRole, router]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVerifyPaymentOpen, setIsVerifyPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit_card" | "stripe">("cash");
  const [createdPayment, setCreatedPayment] = useState<any | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [variantModalQty, setVariantModalQty] = useState(1);
  const [variantModalUnit, setVariantModalUnit] = useState<"satuan" | "lusin" | "box">("satuan");
  const [isOpenSessionModalOpen, setIsOpenSessionModalOpen] = useState(false);
  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<any | null>(null);

  const branchId = profileData?.branches?.[0]?.id || getCookie("pos_branch_id");
  const { data: activeSessionData, isLoading: isActiveSessionLoading, refetch: refetchActiveSession } = useGetActiveSessionQuery();
  const { data: frozenData, isLoading: isCheckingFrozen } = useCheckBranchFrozenQuery(branchId || "", {
    skip: !branchId,
    pollingInterval: 10000, // Re-check every 10 seconds
  });

  const activeSession = activeSessionData;
  const isFrozen = frozenData?.isFrozen;

  useEffect(() => {
    if (!isCheckingFrozen) {
      if (isFrozen) {
        // Frozen: ensure Open Session modal is hidden
        setIsOpenSessionModalOpen(false);
      } else if (!isActiveSessionLoading && !activeSession) {
        // Not frozen and no active session: show Open Session modal
        setIsOpenSessionModalOpen(true);
      }
    }
  }, [activeSession, isActiveSessionLoading, isFrozen, isCheckingFrozen]);

  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery(
    branchId ? { branch_id: branchId } : undefined
  );
  const { data: variantsData } = useGetVariantProductsQuery(
    branchId ? { branch_id: branchId } : undefined
  );
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const {
    data: customersData,
    isLoading: isCustomersLoading,
    refetch: refetchCustomers
  } = useGetAllCustomersQuery();
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    refetch: refetchOrders
  } = useGetOrdersQuery(branchId ? { branch_id: branchId, status: "pending" } : undefined);
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [updateOrderQuantity, { isLoading: isUpdatingQuantity }] = useUpdateOrderQuantityMutation();
  const [deleteOrderItem, { isLoading: isDeletingItem }] = useDeleteOrderItemMutation();
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();
  const { data: activeTaxesData } = useGetActiveTaxesQuery();
  const { data: promotionsData, isLoading: isLoadingPromotions } = useGetPromotionsQuery();
  
  // Filter only non-INACTIVE promotions (let backend status column drive this, not date)
  const activePromotions = (Array.isArray(promotionsData) 
    ? promotionsData 
    : (promotionsData?.datas || promotionsData?.data || []))
    .filter((p: any) => p.status !== "INACTIVE");

  const variantsByProductId = useMemo(() => {
    const grouped = new Map<string, any[]>();
    const variants = variantsData || [];
    variants.forEach((variant: any) => {
      const productId = variant.product_id;
      if (!productId) return;
      const current = grouped.get(productId) || [];
      current.push(variant);
      grouped.set(productId, current);
    });
    return grouped;
  }, [variantsData]);

  const variantsById = useMemo(() => {
    const entries = variantsData || [];
    return new Map<string, any>(entries.map((variant: any) => [variant.id, variant]));
  }, [variantsData]);

  const categories = useMemo(() => {
    const items = categoriesData || [];
    return [{ id: "all", name: "All Items" }, ...items];
  }, [categoriesData]);

  const customers = useMemo(() => customersData || [], [customersData]);

  const productsById = useMemo(() => {
    const entries = productsData || [];
    return new Map<string, any>(entries.map((product: any) => [product.id, product]));
  }, [productsData]);

  const products = useMemo(() => {
    const data = productsData || [];
    return data.filter((product: any) => {
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;

      const query = searchQuery ? searchQuery.toLowerCase() : "";

      // Check product level fields
      const matchesProductSearch =
        !query ||
        product.name_product?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category_name?.toLowerCase().includes(query);

      // Check variant level fields (specifically barcode)
      const variants = variantsByProductId.get(product.id) || [];
      const matchesVariantSearch =
        !query ||
        variants.some((v: any) => v.barcode?.toLowerCase().includes(query));

      const matchesSearch = matchesProductSearch || matchesVariantSearch;

      return matchesCategory && matchesSearch;
    });
  }, [productsData, variantsByProductId, searchQuery, selectedCategory]);

  const orders = useMemo(() => ordersData || [], [ordersData]);
  const pendingOrders = useMemo(() => {
    return orders.filter((order: any) => order.status === "pending");
  }, [orders]);
  const sortedOrders = useMemo(() => {
    return [...pendingOrders].sort((a: any, b: any) => {
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
      return bTime - aTime;
    });
  }, [pendingOrders]);
  useEffect(() => {
    if (isOrdersLoading || isOrdersFetching) return;

    // If we have a selected order but it's no longer in the pending list (e.g. paid), clear it
    if (selectedOrderId) {
      const isStillPending = sortedOrders.some((order: any) => order.id === selectedOrderId);
      if (!isStillPending) {
        setSelectedOrderId(null);
      }
    }

    // DISABLED: Auto-selecting the first pending order on load/refresh
    // This prevents "ghost" orders from appearing without user action
    /*
    if (!sortedOrders.length) {
      if (selectedOrderId) {
        setSelectedOrderId(null);
      }
      return;
    }
    const hasSelected = sortedOrders.some((order: any) => order.id === selectedOrderId);
    if (!selectedOrderId || !hasSelected) {
      setSelectedOrderId(sortedOrders[0].id);
    }
    */
  }, [sortedOrders]);
  const currentOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return sortedOrders.find((order: any) => order.id === selectedOrderId) || null;
  }, [selectedOrderId, sortedOrders]);
  const orderItems = currentOrder?.items || [];
  const subtotal =
    currentOrder?.subtotal ??
    orderItems.reduce((sum: number, item: any) => {
      return sum + Number(item.subtotal || 0);
    }, 0);
  const activeTax = activeTaxesData?.[0];
  const taxRatePercent = activeTax ? Number(activeTax.rate) : 5;
  const taxRate = taxRatePercent / 100;
  const taxName = activeTax ? `${activeTax.name} (${taxRatePercent}%)` : `Service Tax (5%)`;
  const taxAmount = subtotal * taxRate;
  const discountAmount = currentOrder?.discount_amount ?? 0;
  const discountName = currentOrder?.promotion?.name || currentOrder?.discount?.name || "Promotion";
  const totalAmount = currentOrder?.total_amount ?? subtotal + taxAmount - discountAmount;

  const { formik, isLoading } = usePosOrder({ initialItems: [] });

  const handleNewOrder = () => {
    setSelectedOrderId(null);
    formik.resetForm();
    toast.success("Ready for new order");
  };

  const selectedCustomer = useMemo(() => {
    if (!formik.values.customer_id) return null;
    return customers.find((customer: any) => customer.id === formik.values.customer_id);
  }, [customers, formik.values.customer_id]);

  const { formik: customerFormik, isLoading: isCreatingCustomer } = useCustomerForm({
    onSuccess: (customer) => {
      setIsCreateCustomerOpen(false);
      setIsCustomerModalOpen(false);
      if (customer?.id) {
        formik.setFieldValue("customer_id", customer.id);
      }
      refetchCustomers();
    }
  });

  const handleAddToCart = async (product: any, variant: any = null, nextQuantity: number = 1) => {
    try {
      const price = variant ? Number(variant.price || 0) : Number(product.price || 0);

      if (!activeSession) {
        setIsOpenSessionModalOpen(true);
        toast.error("Please open a POS session first");
        return;
      }

      if (isFrozen) {
        toast.error("Inventory is currently frozen for audit. POS operations are suspended.");
        return;
      }

      const response = await createOrder({
        order_id: selectedOrderId || undefined,
        branch_id: branchId || undefined,
        customer_id: formik.values.customer_id || undefined,
        items: [
          {
            productId: product.id,
            variantId: variant?.id,
            quantity: String(nextQuantity),
            price
          }
        ]
      }).unwrap();

      const orderId = response?.data?.id || response?.data?.order?.id || response?.id;

      if (orderId && orderId !== selectedOrderId) {
        setSelectedOrderId(orderId);
      }
      refetchOrders();
      if (variant) {
        setSelectedProductForVariant(null);
        setSelectedVariant(null);
        setVariantModalQty(1);
        setVariantModalUnit("satuan");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add product to order");
    }
  };

  const handleUpdateQuantity = async (orderItemId: string, nextQuantity: number) => {
    if (!currentOrder?.id || nextQuantity < 1) return;
    try {
      await updateOrderQuantity({
        orderId: currentOrder.id,
        orderItemId,
        quantity: nextQuantity
      }).unwrap();
      refetchOrders();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update quantity");
    }
  };

  const handleDeleteOrderItem = async (orderItemId: string) => {
    if (!currentOrder?.id) return;
    try {
      await deleteOrderItem({
        orderId: currentOrder.id,
        orderItemId
      }).unwrap();
      refetchOrders();
      toast.success("Item removed from order");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove item");
    }
  };

  const handleProcessPayment = async () => {
    if (!currentOrder?.id) {
      toast.error("No active order to update");
      return;
    }
    if (orderItems.length === 0) {
      return;
    }
    if (isFrozen) {
      toast.error("Inventory is currently frozen for audit. POS operations are suspended.");
      return;
    }
    if (!formik.values.customer_id) {
      toast.error("Please select a customer first");
      return;
    }
    try {
      await updateOrder({
        id: currentOrder.id,
        body: { customer_id: formik.values.customer_id }
      }).unwrap();
      refetchOrders();
      setIsPaymentModalOpen(true);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update order");
    }
  };

  const handleApplyDiscount = async (promotionId: string) => {
    if (!currentOrder?.id) return;
    try {
      await updateOrder({
        id: currentOrder.id,
        body: { promotion_id: promotionId }
      }).unwrap();
      refetchOrders();
      setIsDiscountModalOpen(false);
      if (promotionId === "remove") {
        toast.success("Promotion removed");
      } else {
        toast.success("Promotion applied successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to apply promotion");
    }
  };

  const handleCreatePayment = async (selectedMethod?: typeof paymentMethod) => {
    if (!currentOrder?.id) {
      toast.error("No active order found");
      return;
    }
    const methodToUse = selectedMethod || paymentMethod;
    setIsPaymentModalOpen(false);
    try {
      const response = await createPayment({
        orderId: currentOrder.id,
        method: methodToUse
      }).unwrap();
      setCreatedPayment(response?.data || response || null);
      setIsVerifyPaymentOpen(true);
      toast.success("Payment created");
    } catch (error: any) {
      setIsPaymentModalOpen(true);
      toast.error(error?.data?.message || "Failed to create payment");
    }
  };

  const handleVerifyPayment = async () => {
    if (!createdPayment?.id) {
      toast.error("No payment to verify");
      return;
    }
    try {
      await verifyPayment(createdPayment.id).unwrap();
      setVerifiedOrder(currentOrder);
      setIsVerifyPaymentOpen(false);
      setIsReceiptOpen(true);
      setCreatedPayment(null);
      refetchOrders();
      toast.success("Payment verified");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to verify payment");
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleProcessPayment();
      }}
      className="relative flex h-[calc(100svh-4rem)] flex-col lg:flex-row overflow-hidden -m-6 rounded-none">
      {/* Left Area: Products */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border bg-muted/5">
        <div className="flex flex-col gap-4 border-b border-border bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">New Order</h1>
              <p className="text-muted-foreground text-xs">Branch: {profileData?.branches?.[0]?.name || "Main"}</p>
            </div>
            {activeSession && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-8 text-xs text-destructive hover:bg-destructive/5"
                onClick={() => setIsCloseSessionModalOpen(true)}>
                Close Session
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search products or scan barcode..."
              className="pl-9 h-11 bg-muted/30 border-none ring-0 focus-visible:ring-1"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
            {categories.map((category: any) => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`shrink-0 rounded-full h-8 px-4 ${selectedCategory === category.id ? "shadow-md" : ""}`}
                type="button"
                onClick={() => setSelectedCategory(category.id)}>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product: any) => {
              const variants = variantsByProductId.get(product.id) || [];
              const imageSource =
                product.thumbnail ||
                (Array.isArray(product.images) ? product.images[0] : null) ||
                "/placeholder-image.jpg";
              const hasVariants = variants.length > 0;

              const stock = hasVariants
                ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
                : typeof product.product_stock === "number"
                  ? product.product_stock
                  : 0;

              const displayPrice = hasVariants
                ? Math.min(...variants.map((v: any) => Number(v.price) || 0))
                : Number(product.price || 0);

              const maxPrice = hasVariants
                ? Math.max(...variants.map((v: any) => Number(v.price) || 0))
                : displayPrice;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    if (hasVariants) {
                      setSelectedProductForVariant(product);
                    } else {
                      handleAddToCart(product);
                    }
                  }}
                  className="group flex flex-col items-start rounded-2xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-md h-full">
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={imageSource}
                      alt={product.name_product}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {stock === 0 && !hasVariants && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white backdrop-blur-[1px]">
                        Out of Stock
                      </div>
                    )}
                    {stock > 0 && stock <= 5 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-[10px] font-bold text-white rounded-full shadow-sm">
                        Low Stock
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 w-full gap-1">
                    <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 min-h-[2.5rem]">
                      {product.name_product}
                    </h3>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs text-muted-foreground">
                        {hasVariants ? `${variants.length} options` : `${stock} pcs`}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        {hasVariants && displayPrice !== maxPrice
                          ? `$${displayPrice.toFixed(2)}+`
                          : `$${displayPrice.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {!isProductsLoading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Search className="size-10 mb-2 opacity-20" />
              <p className="text-sm">No products found</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Area: Cart & Summary */}
      <div className="flex w-full flex-col lg:w-[380px] xl:w-[420px] bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-4 min-h-[4.5rem]">
          <div>
            <h2 className="text-base font-bold text-foreground">Active Order</h2>
            {selectedCustomer && (
              <p className="text-[10px] text-primary font-medium">{selectedCustomer.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" className="size-8 rounded-full" type="button" onClick={handleNewOrder}>
              <Plus className="size-4" />
            </Button>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
              {orderItems.reduce((s: number, i: any) => s + Number(i.qty || 0), 0)} items
            </span>
          </div>
        </div>

        {/* Customer & Info Banner */}
        <div className="p-4 bg-muted/30 border-b border-border">
          <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex w-full items-center gap-3 p-3 bg-card rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg shrink-0">
              <UserRoundPlus className="size-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold truncate">
                {selectedCustomer?.name || "Select Customer"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {selectedCustomer ? `${selectedCustomer.email || "No email"}` : "Earn loyalty points & track orders"}
              </p>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto px-4 py-2">
          {isOrdersLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs">Loading items...</p>
            </div>
          ) : orderItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
              <Package className="size-12" />
              <div className="text-center">
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-[10px]">Tap products to add them here</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              {orderItems.map((item: any) => {
                const variant = item.variant_id ? variantsById.get(item.variant_id) : null;
                const product = item.product_id
                  ? productsById.get(item.product_id)
                  : variant?.product;
                const itemName = variant?.name_variant || product?.name_product || "Item";

                return (
                  <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{itemName}</p>
                        <p className="text-xs text-muted-foreground">${Number(item.price || 0).toFixed(2)} / unit</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        type="button"
                        disabled={isDeletingItem}
                        onClick={() => handleDeleteOrderItem(item.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 rounded-md hover:bg-background"
                          type="button"
                          disabled={isUpdatingQuantity || item.qty <= 1}
                          onClick={() => handleUpdateQuantity(item.id, Number(item.qty || 0) - 1)}>
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6 rounded-md hover:bg-background"
                          type="button"
                          disabled={isUpdatingQuantity}
                          onClick={() => handleUpdateQuantity(item.id, Number(item.qty || 0) + 1)}>
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-bold text-primary">
                        ${Number(item.subtotal || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchase Footer */}
        <div className="border-t border-border p-4 bg-background shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span>${Number(subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{taxName}</span>
              <span>${Number(taxAmount || 0).toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs font-medium text-destructive">
                <span>{currentOrder?.promotion?.name || currentOrder?.discount?.name || "Promotion"}</span>
                <span>-${Number(discountAmount || 0).toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-base font-bold">Total Amount</span>
              <span className="text-xl font-black text-primary animate-in fade-in zoom-in duration-300">
                ${Number(totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full h-10 border-dashed rounded-xl text-xs"
              type="button"
              onClick={() => setIsDiscountModalOpen(true)}
              disabled={isLoading || isUpdatingOrder || !currentOrder?.id || orderItems.length === 0}>
              {discountAmount > 0 || currentOrder?.promotion_id ? "Change Promotion" : "Add Promotion"}
            </Button>
            <Button
              className="w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              type="submit"
              disabled={isLoading || isUpdatingOrder || !currentOrder?.id || orderItems.length === 0}>
                    Charge ${Number(totalAmount || 0).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      {/* Blocking Modal for Frozen Stock Take */}
      <Dialog open={!!isFrozen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader className="text-center pb-2">
            <div className="mx-auto mb-4 bg-blue-100 text-blue-600 p-4 rounded-full w-fit">
              <Lock className="size-10" />
            </div>
            <DialogTitle className="text-2xl font-black text-blue-900 text-center">POS Operations Suspended</DialogTitle>
             <DialogDescription className="text-center hidden">Access to POS is blocked</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertTriangle className="size-4" />
              <AlertTitle className="font-bold">Inventory Frozen (Stock Take In Progress)</AlertTitle>
              <AlertDescription className="text-sm">
                This branch is currently undergoing a physical inventory audit.
                All sales operations are disabled to ensure 100% data accuracy.
              </AlertDescription>
            </Alert>

            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Audit Session</span>
                <span className="font-mono font-bold">#{frozenData?.session?.id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Started By</span>
                <span className="font-bold">{frozenData?.session?.user?.name || "Inventory Team"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Date Started</span>
                <span className="font-bold">{frozenData?.session?.createdAt ? new Date(frozenData.session.createdAt).toLocaleString() : "-"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Please wait until the audit is COMPLETED or REJECTED by a manager.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedProductForVariant}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProductForVariant(null);
            setSelectedVariant(null);
            setVariantModalQty(1);
            setVariantModalUnit("satuan");
          }
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedVariant ? `Configure ${selectedVariant.name_variant}` : "Select Variant"}
            </DialogTitle>
            <DialogDescription>
              {selectedVariant
                ? `Set quantity and unit for ${selectedVariant.name_variant}`
                : `Choose a variant for ${selectedProductForVariant?.name_product}`
              }
            </DialogDescription>
          </DialogHeader>

          {!selectedVariant ? (
            <div className="grid gap-2">
              {selectedProductForVariant &&
                variantsByProductId.get(selectedProductForVariant.id)?.map((variant: any) => {
                  const variantStock = Number(variant.stock || 0);
                  return (
                    <Button
                      key={variant.id}
                      variant="outline"
                      className="flex h-auto items-center justify-between p-4 hover:border-primary/50 transition-colors"
                      disabled={variantStock === 0}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}>
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold">{variant.name_variant}</span>
                        <span className="text-muted-foreground text-xs">SKU: {variant.sku || "-"}</span>
                        <p
                          className={`text-[10px] font-bold ${variantStock > 5 ? "text-green-600" : variantStock > 0 ? "text-yellow-600" : "text-red-600"}`}>
                          {variantStock > 0 ? `${variantStock} in stock` : "Out of Stock"}
                        </p>
                      </div>
                      <span className="text-primary font-bold">
                        ${Number(variant.price || 0).toFixed(2)}
                      </span>
                    </Button>
                  );
                })}
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select Unit</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={variantModalUnit === "satuan" ? "default" : "outline"}
                    className="flex flex-col h-16 gap-1"
                    onClick={() => setVariantModalUnit("satuan")}>
                    <span className="text-sm font-bold">Satuan</span>
                    <span className="text-[10px] opacity-70">x1</span>
                  </Button>
                  <Button
                    type="button"
                    variant={variantModalUnit === "lusin" ? "default" : "outline"}
                    className="flex flex-col h-16 gap-1"
                    onClick={() => setVariantModalUnit("lusin")}>
                    <span className="text-sm font-bold">Lusin</span>
                    <span className="text-[10px] opacity-70">x12</span>
                  </Button>
                  <Button
                    type="button"
                    variant={variantModalUnit === "box" ? "default" : "outline"}
                    className="flex flex-col h-16 gap-1"
                    onClick={() => setVariantModalUnit("box")}>
                    <span className="text-sm font-bold">Box</span>
                    <span className="text-[10px] opacity-70">x24</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quantity</Label>
                <div className="flex items-center justify-center gap-4 bg-muted/30 p-4 rounded-2xl">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-full"
                    onClick={() => setVariantModalQty(Math.max(1, variantModalQty - 1))}>
                    <Minus className="size-4" />
                  </Button>
                  <div className="text-center min-w-16">
                    <span className="text-2xl font-black">{variantModalQty}</span>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{variantModalUnit}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-full"
                    onClick={() => setVariantModalQty(variantModalQty + 1)}>
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex justify-between items-center px-1 mb-2">
                  <span className="text-sm text-muted-foreground">Total Quantity:</span>
                  <span className="text-sm font-bold">
                    {variantModalQty * (variantModalUnit === "satuan" ? 1 : variantModalUnit === "lusin" ? 12 : 24)} pcs
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={() => setSelectedVariant(null)}>
                    Back
                  </Button>
                  <Button
                    className="flex-[2] font-bold"
                    type="button"
                    onClick={() => {
                      const multiplier = variantModalUnit === "satuan" ? 1 : variantModalUnit === "lusin" ? 12 : 24;
                      handleAddToCart(selectedProductForVariant, selectedVariant, variantModalQty * multiplier);
                    }}>
                    Confirm Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="sm:max-w-md flex flex-col h-[85vh] sm:h-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold">Select Customer</DialogTitle>
            <DialogDescription>
              Search and choose a customer for this transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-4 pt-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, or email..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-1"
              />
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary font-bold transition-all rounded-xl gap-2"
              type="button"
              onClick={() => {
                setIsCustomerModalOpen(false);
                setIsCreateCustomerOpen(true);
              }}>
              <UserRoundPlus className="size-4" />
              Create New Customer
            </Button>
          </div>

          <Separator />

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-none">
            {isCustomersLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs">Finding customers...</p>
              </div>
            ) : customers.filter((c: any) =>
                c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                c.phone?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
              ).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                <Search className="size-10 mb-2" />
                <p className="text-sm font-medium">No customers found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            ) : (
              customers
                .filter((c: any) =>
                  c.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                  c.phone?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                  c.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                )
                .map((customer: any) => {
                  const isSelected = formik.values.customer_id === customer.id;
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        formik.setFieldValue("customer_id", customer.id);
                        setIsCustomerModalOpen(false);
                        setCustomerSearchQuery("");
                      }}
                      className={`w-full group text-left p-4 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-card border-border hover:border-primary/40 hover:shadow-md"
                      }`}>
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        }`}>
                          <User className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`font-bold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {customer.name}
                            </p>
                            {isSelected && (
                              <div className="px-2 py-0.5 bg-primary text-[10px] font-black text-white rounded-full uppercase">
                                Selected
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            {customer.phone && (
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Phone className="size-3" />
                                {customer.phone}
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Mail className="size-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
            )}
          </div>

          <div className="p-4 border-t bg-muted/10">
             <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-wider">
               Showing {customers.length} total customers
             </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Promotion</DialogTitle>
            <DialogDescription>Apply a promotion to the current order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {(discountAmount > 0 || currentOrder?.promotion_id) && (
              <Button
                variant="destructive"
                className="w-full"
                type="button"
                onClick={() => handleApplyDiscount("remove")}>
                Remove Current Promotion
              </Button>
            )}
            {isLoadingPromotions ? (
              <div className="text-muted-foreground py-4 text-center text-sm">
                Loading promotions...
              </div>
            ) : activePromotions?.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center text-sm">
                No active promotions available.
              </div>
            ) : (
              activePromotions?.map((promotion: any) => (
                <Button
                  key={promotion.id}
                  variant="outline"
                  className="h-auto w-full items-center justify-between p-4"
                  type="button"
                  onClick={() => handleApplyDiscount(promotion.id)}>
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">{promotion.name}</span>
                    <span className="text-muted-foreground text-xs">{promotion.description}</span>
                  </div>
                  <span className="text-primary font-bold">
                    {promotion.rules?.[0]?.actionType === "PERCENT_DISCOUNT"
                      ? `${promotion.rules[0].actionValue.percentage}%`
                      : promotion.rules?.[0]?.actionType === "FIXED_DISCOUNT"
                      ? `$${Number(promotion.rules[0].actionValue.amount).toFixed(2)}`
                      : "Active"}
                  </span>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateCustomerOpen} onOpenChange={setIsCreateCustomerOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Customer</DialogTitle>
            <DialogDescription>Fill in the customer details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={customerFormik.handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input
                id="customer-name"
                name="name"
                value={customerFormik.values.name}
                onChange={customerFormik.handleChange}
                onBlur={customerFormik.handleBlur}
              />
              {customerFormik.touched.name && customerFormik.errors.name ? (
                <p className="text-destructive text-xs">{customerFormik.errors.name}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                name="phone"
                value={customerFormik.values.phone}
                onChange={customerFormik.handleChange}
                onBlur={customerFormik.handleBlur}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                name="email"
                value={customerFormik.values.email}
                onChange={customerFormik.handleChange}
                onBlur={customerFormik.handleBlur}
              />
              {customerFormik.touched.email && customerFormik.errors.email ? (
                <p className="text-destructive text-xs">{customerFormik.errors.email}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-address">Address</Label>
              <Input
                id="customer-address"
                name="address"
                value={customerFormik.values.address}
                onChange={customerFormik.handleChange}
                onBlur={customerFormik.handleBlur}
              />
              {customerFormik.touched.address && customerFormik.errors.address ? (
                <p className="text-destructive text-xs">{customerFormik.errors.address}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-city">City</Label>
              <Input
                id="customer-city"
                name="city"
                value={customerFormik.values.city}
                onChange={customerFormik.handleChange}
                onBlur={customerFormik.handleBlur}
              />
              {customerFormik.touched.city && customerFormik.errors.city ? (
                <p className="text-destructive text-xs">{customerFormik.errors.city}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-country">Country</Label>
              <Input
                id="customer-country"
                name="country"
                value={customerFormik.values.country}
                onChange={customerFormik.handleChange}
                onBlur={customerFormik.handleBlur}
              />
              {customerFormik.touched.country && customerFormik.errors.country ? (
                <p className="text-destructive text-xs">{customerFormik.errors.country}</p>
              ) : null}
            </div>
            <Button className="w-full" type="submit" disabled={isCreatingCustomer}>
              Create Customer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <OpenSessionModal
        isOpen={isOpenSessionModalOpen}
        onOpenChange={setIsOpenSessionModalOpen}
        branchId={branchId || ""}
        onSuccess={() => {
          refetchActiveSession();
          refetchOrders();
        }}
      />

      {activeSession && (
        <CloseSessionModal
          isOpen={isCloseSessionModalOpen}
          onOpenChange={setIsCloseSessionModalOpen}
          sessionId={activeSession.id}
          onSuccess={() => {
            refetchActiveSession();
            // Reset local state if needed
            setSelectedOrderId(null);
          }}
        />
      )}

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>Choose how the customer pays this order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 overflow-y-auto max-h-[60vh] p-1">
            <Button
              variant={paymentMethod === "cash" ? "default" : "outline"}
              className="h-16 text-lg justify-start px-6 gap-4"
              type="button"
              onClick={() => {
                setPaymentMethod("cash");
                handleCreatePayment("cash");
              }}>
              <div className="bg-primary/10 p-2 rounded-full overflow-hidden flex items-center justify-center">
                <Image src="/images/dollar.png" alt="Cash" width={24} height={24} className="size-6 object-contain" />
              </div>
              Cash
            </Button>
            <Button
              variant={paymentMethod === "credit_card" ? "default" : "outline"}
              className="h-16 text-lg justify-start px-6 gap-4"
              type="button"
              onClick={() => {
                setPaymentMethod("credit_card");
                handleCreatePayment("credit_card");
              }}>
              <div className="bg-primary/10 p-2 rounded-full overflow-hidden flex items-center justify-center">
                <Image src="/images/payment.png" alt="Manual Card/EDC" width={24} height={24} className="size-6 object-contain" />
              </div>
              Manual Card/EDC
            </Button>
            <Button
              variant={paymentMethod === "stripe" ? "default" : "outline"}
              className="h-16 text-lg justify-start px-6 gap-4"
              type="button"
              onClick={() => {
                setPaymentMethod("stripe");
                handleCreatePayment("stripe");
              }}>
              <div className="bg-primary/10 p-2 rounded-full overflow-hidden flex items-center justify-center">
                <Image src="/images/logo-stripe.svg" alt="Stripe" width={24} height={24} className="size-6 object-contain" />
              </div>
              Stripe
            </Button>
          </div>
          <div className="text-right font-bold text-lg pt-2 border-t mt-2">
            Total: ${Number(totalAmount || 0).toFixed(2)}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isVerifyPaymentOpen} onOpenChange={setIsVerifyPaymentOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>Confirm payment and complete the order.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
            <div className="grid gap-1">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-semibold">{createdPayment?.id || "-"}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Method</span>
              <span className="font-semibold">
                {createdPayment?.paymentMethod || paymentMethod}
              </span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold">
                ${Number(createdPayment?.amount || totalAmount || 0).toFixed(2)}
              </span>
            </div>

            {createdPayment?.client_secret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: createdPayment.client_secret,
                  appearance: { theme: "stripe" }
                }}>
                <StripePayment
                  clientSecret={createdPayment.client_secret}
                  onSuccess={(paymentIntentId) => {
                    handleVerifyPayment();
                  }}
                  onCancel={() => {
                    setIsVerifyPaymentOpen(false);
                  }}
                />
              </Elements>
            )}

            {!createdPayment?.client_secret && (
              <Button
                className="w-full"
                type="button"
                disabled={isVerifyingPayment}
                onClick={handleVerifyPayment}>
                Verify Payment
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setVerifiedOrder(null);
          setSelectedOrderId(null); // Reset for next order
        }}
        order={verifiedOrder}
        onPrint={() => {
          window.print();
        }}
      />
    </form>
  );
};
