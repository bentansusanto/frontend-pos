"use client";

import { ChevronDown, Minus, Plus, Search, Trash2, UserRoundPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
import { getCookie } from "@/utils/cookies";
import { toast } from "sonner";
import { useCustomerForm } from "../Customers/hooks";
import { usePosOrder } from "./hooks";

export const PosPage = () => {
  const router = useRouter();
  const { data: profileData } = useGetProfileQuery();
  const userRole = profileData?.data?.role;

  useEffect(() => {
    if (userRole && userRole !== "cashier") {
      router.push("/access-denied");
    }
  }, [userRole, router]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isVerifyPaymentOpen, setIsVerifyPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit_card">("cash");
  const [createdPayment, setCreatedPayment] = useState<any | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any | null>(null);
  const branchId = getCookie("pos_branch_id");
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
  } = useGetOrdersQuery(branchId ? { branch_id: branchId } : undefined);
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();
  const [updateOrderQuantity, { isLoading: isUpdatingQuantity }] = useUpdateOrderQuantityMutation();
  const [deleteOrderItem, { isLoading: isDeletingItem }] = useDeleteOrderItemMutation();
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePaymentMutation();
  const [verifyPayment, { isLoading: isVerifyingPayment }] = useVerifyPaymentMutation();

  const variantsByProductId = useMemo(() => {
    const grouped = new Map<string, any[]>();
    const variants = variantsData?.data || [];
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
    const entries = variantsData?.data || [];
    return new Map<string, any>(entries.map((variant: any) => [variant.id, variant]));
  }, [variantsData]);

  const categories = useMemo(() => {
    const items = categoriesData?.data || [];
    return [{ id: "all", name: "All Items" }, ...items];
  }, [categoriesData]);

  const customers = useMemo(() => customersData?.data || [], [customersData]);

  const productsById = useMemo(() => {
    const entries = productsData?.data || [];
    return new Map<string, any>(entries.map((product: any) => [product.id, product]));
  }, [productsData]);

  const products = useMemo(() => {
    const data = productsData?.data || [];
    return data.filter((product: any) => {
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        product.name_product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [productsData, searchQuery, selectedCategory]);

  const orders = useMemo(() => ordersData?.data || [], [ordersData]);
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
  const taxAmount = currentOrder?.tax_amount ?? subtotal * 0.05;
  const discountAmount = currentOrder?.discount_amount ?? 0;
  const totalAmount = currentOrder?.total_amount ?? subtotal + taxAmount - discountAmount;

  const { formik, isLoading } = usePosOrder({ initialItems: [] });

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

  const handleAddToCart = async (product: any, variant: any = null) => {
    try {
      const price = variant ? Number(variant.price || 0) : Number(product.price || 0);
      const response = await createOrder({
        order_id: selectedOrderId || undefined,
        branch_id: branchId || undefined,
        customer_id: formik.values.customer_id || undefined,
        items: [
          {
            productId: product.id,
            variantId: variant?.id,
            quantity: "1",
            price
          }
        ]
      }).unwrap();
      // The backend response structure for create order might be returning { order, items } directly in data
      // instead of { data: { id: ... } }. Let's check both possibilities or refetch to be safe.
      const orderId = response?.data?.id || response?.order?.id;

      if (orderId && orderId !== selectedOrderId) {
        setSelectedOrderId(orderId);
      }
      refetchOrders();
      if (variant) {
        setSelectedProductForVariant(null);
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
      toast.error("No items in current order");
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

  const handleCreatePayment = async () => {
    if (!currentOrder?.id) {
      toast.error("No active order found");
      return;
    }
    try {
      const response = await createPayment({
        orderId: currentOrder.id,
        method: paymentMethod
      }).unwrap();
      setCreatedPayment(response?.data || null);
      setIsPaymentModalOpen(false);
      setIsVerifyPaymentOpen(true);
      toast.success("Payment created");
    } catch (error: any) {
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
      setIsVerifyPaymentOpen(false);
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
      className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <Card className="flex h-full flex-col lg:sticky lg:top-6 lg:h-[calc(100svh-6rem)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Order</CardTitle>
            <Button variant="ghost" size="icon" type="button">
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-dashed px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full">
                <UserRoundPlus className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {selectedCustomer?.name || "Assign Customer"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {selectedCustomer ? "Customer selected" : "Earn loyalty points"}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="outline"
              type="button"
              onClick={() => setIsCustomerModalOpen(true)}>
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {isOrdersLoading ? (
              <div className="text-muted-foreground text-sm">Loading orders...</div>
            ) : orderItems.length === 0 ? (
              <div className="text-muted-foreground text-sm">No items in current order.</div>
            ) : (
              orderItems.map((item: any) => {
                const variant = item.variant_id ? variantsById.get(item.variant_id) : null;
                const product = item.product_id
                  ? productsById.get(item.product_id)
                  : variant?.product;
                const itemName = variant?.name_variant || product?.name_product || "Item";
                const itemImage =
                  item.image ||
                  variant?.thumbnail ||
                  product?.thumbnail ||
                  (Array.isArray(product?.images) ? product.images[0] : null) ||
                  "/placeholder-image.jpg";
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="size-12 overflow-hidden rounded-lg border">
                      <Image
                        src={itemImage}
                        alt={itemName}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{itemName}</p>
                        <p className="text-sm font-semibold">
                          ${Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          type="button"
                          disabled={isUpdatingQuantity || item.qty <= 1}
                          onClick={() => handleUpdateQuantity(item.id, Number(item.qty || 0) - 1)}>
                          <Minus className="size-3" />
                        </Button>
                        <span className="text-sm font-semibold">{item.qty}</span>
                        <Button
                          size="icon"
                          className="h-7 w-7"
                          type="button"
                          disabled={isUpdatingQuantity}
                          onClick={() => handleUpdateQuantity(item.id, Number(item.qty || 0) + 1)}>
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="ml-auto h-7 w-7"
                          type="button"
                          disabled={isDeletingItem}
                          onClick={() => handleDeleteOrderItem(item.id)}>
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Subtotal</span>
              <span>${Number(subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Service Tax (5%)</span>
              <span>${Number(taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">${Number(totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            type="submit"
            disabled={isLoading || isUpdatingOrder || !currentOrder?.id}>
            Process Payment
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6">
        <div className="bg-background sticky top-0 z-10 space-y-4 px-3 pt-6 pb-3">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-4">
              <h1 className="text-foreground text-xl font-semibold">New Order</h1>
              <p className="text-muted-foreground text-sm">
                Find products, add to cart, and process payment.
              </p>
            </div>
            <div className="grid gap-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search products, category, or scan barcode..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category: any) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={selectedCategory === category.id ? "shadow-sm" : ""}
                type="button"
                onClick={() => setSelectedCategory(category.id)}>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: any) => {
            const variants = variantsByProductId.get(product.id) || [];
            const imageSource =
              product.thumbnail ||
              (Array.isArray(product.images) ? product.images[0] : null) ||
              "/placeholder-image.jpg";
            const stock = typeof product.product_stock === "number" ? product.product_stock : 0;
            const hasVariants = variants.length > 0;

            return (
              <div
                key={product.id}
                className="group hover:border-primary/50 relative flex cursor-pointer flex-col items-center rounded-md border-2 bg-white pb-4 shadow-sm transition-all hover:border-2 hover:shadow-md dark:bg-slate-900"
                onClick={() => {
                  if (hasVariants) {
                    setSelectedProductForVariant(product);
                  } else {
                    handleAddToCart(product);
                  }
                }}>
                <div className="relative mb-3 aspect-square h-40 w-full overflow-hidden rounded-md shadow-md">
                  <Image
                    src={imageSource}
                    alt={product.name_product}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-bold text-white">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="w-full px-3 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-card-foreground line-clamp-1 text-sm font-semibold">
                      {product.name_product}
                    </h3>
                    <p className="text-primary mt-1 text-sm font-bold">
                      ${Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p
                    className={`mt-1 text-xs font-medium ${stock > 5 ? "text-green-600" : stock > 0 ? "text-yellow-600" : "text-red-600"}`}>
                    {stock > 0 ? `${stock} in stock` : "Out of Stock"}
                  </p>
                  {hasVariants && (
                    <p className="text-muted-foreground mt-1 text-[10px]">
                      {variants.length} Variants
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {!isProductsLoading && products.length === 0 ? (
            <div className="text-muted-foreground text-sm">No products available.</div>
          ) : null}
        </div>
      </div>

      <Dialog
        open={!!selectedProductForVariant}
        onOpenChange={(open) => !open && setSelectedProductForVariant(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Variant</DialogTitle>
            <DialogDescription>
              Choose a variant for {selectedProductForVariant?.name_product}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {selectedProductForVariant &&
              variantsByProductId.get(selectedProductForVariant.id)?.map((variant: any) => (
                <Button
                  key={variant.id}
                  variant="outline"
                  className="flex h-auto items-center justify-between p-4"
                  onClick={() => handleAddToCart(selectedProductForVariant, variant)}>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{variant.name_variant}</span>
                    <span className="text-muted-foreground text-xs">SKU: {variant.sku || "-"}</span>
                  </div>
                  <span className="text-primary font-bold">
                    ${Number(variant.price || 0).toFixed(2)}
                  </span>
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>Choose a customer for this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full border-dashed"
              type="button"
              onClick={() => {
                setIsCustomerModalOpen(false);
                setIsCreateCustomerOpen(true);
              }}>
              Create New Customer
            </Button>
            {isCustomersLoading ? (
              <div className="text-muted-foreground text-sm">Loading customers...</div>
            ) : customers.length === 0 ? (
              <div className="text-muted-foreground text-sm">No customers available.</div>
            ) : (
              customers.map((customer: any) => (
                <Button
                  key={customer.id}
                  variant="outline"
                  className="w-full justify-start"
                  type="button"
                  onClick={() => {
                    formik.setFieldValue("customer_id", customer.id);
                    setIsCustomerModalOpen(false);
                  }}>
                  {customer.name}
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

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>Choose how the customer pays this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                type="button"
                onClick={() => setPaymentMethod("cash")}>
                Cash
              </Button>
              <Button
                variant={paymentMethod === "credit_card" ? "default" : "outline"}
                type="button"
                onClick={() => setPaymentMethod("credit_card")}>
                Credit Card
              </Button>
            </div>
            <div className="text-muted-foreground text-sm">
              Total: ${Number(totalAmount || 0).toFixed(2)}
            </div>
            <Button
              className="w-full"
              type="button"
              disabled={isCreatingPayment}
              onClick={handleCreatePayment}>
              Create Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isVerifyPaymentOpen} onOpenChange={setIsVerifyPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>Confirm payment and complete the order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
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
            <Button
              className="w-full"
              type="button"
              disabled={isVerifyingPayment}
              onClick={handleVerifyPayment}>
              Verify Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};
