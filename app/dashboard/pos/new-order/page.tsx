"use client";

import { ChevronDown, Minus, Plus, Search, ShoppingBag, UserRoundPlus } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const categories = [
  { label: "All Items", active: true },
  { label: "Hot Food" },
  { label: "Beverages" },
  { label: "Bakery" },
  { label: "Desserts" }
];

const products = [
  {
    name: "Double Espresso",
    price: 3.5,
    stock: 124,
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Avocado Toast",
    price: 12.5,
    stock: 42,
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Cappuccino",
    price: 4.75,
    stock: 86,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Glazed Donut",
    price: 2.25,
    stock: 56,
    selected: true,
    image:
      "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Blueberry Muffin",
    price: 3.25,
    stock: 48,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "French Macaron",
    price: 6.0,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1464347744102-11db6282f854?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Classic Burger",
    price: 14.5,
    stock: 64,
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Garden Salad",
    price: 9.0,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Garden Salad",
    price: 9.0,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Garden Salad",
    price: 9.0,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Garden Salad",
    price: 9.0,
    stock: 40,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
  }
];

const orderItems = [
  {
    name: "Glazed Donut",
    price: 2.25,
    qty: 2,
    image:
      "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?q=80&w=800&auto=format&fit=crop"
  },
  {
    name: "Cappuccino",
    price: 4.75,
    qty: 1,
    note: "Oat milk, Extra shot",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop"
  }
];

export default function NewOrderPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <Card className="flex h-full flex-col lg:sticky lg:top-6 lg:h-[calc(100svh-6rem)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Order</CardTitle>
            <Button variant="ghost" size="icon">
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
                <p className="text-sm font-semibold">Assign Customer</p>
                <p className="text-muted-foreground text-xs">Earn loyalty points</p>
              </div>
            </div>
            <Button size="icon" variant="outline">
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.name} className="flex items-start gap-3">
                <div className="size-12 overflow-hidden rounded-lg border">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                  {item.note && <p className="text-muted-foreground text-xs">{item.note}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7">
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-sm font-semibold">{item.qty}</span>
                    <Button size="icon" className="h-7 w-7">
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Subtotal</span>
              <span>$9.25</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Service Tax (10%)</span>
              <span>$0.93</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">$10.18</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="grid w-full grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              Bill Split
            </Button>
            <Button variant="outline" className="w-full">
              Coupon
            </Button>
          </div>
          <Button className="w-full">Process Payment</Button>
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
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Button
                key={category.label}
                variant={category.active ? "default" : "outline"}
                className={category.active ? "shadow-sm" : ""}>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <Card
              key={`${product.name}-${index}`}
              className={`overflow-hidden transition-all ${
                product.selected ? "border-primary shadow-md" : "hover:border-primary/30"
              }`}>
              <div className="relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={240}
                  className="h-32 w-full object-cover"
                />
                {product.selected && (
                  <span className="bg-primary text-primary-foreground absolute top-3 right-3 flex size-9 items-center justify-center rounded-full">
                    <ShoppingBag className="size-4" />
                  </span>
                )}
              </div>
              <CardContent className="gap-2 px-4 pt-4 pb-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{product.name}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {product.stock} in stock
                  </Badge>
                </div>
                <div className="text-primary text-base font-semibold">
                  ${product.price.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
