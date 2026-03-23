"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Package, Plus, Receipt, Truck } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCreateBatch } from "./hooks";

export default function CreateBatchDialog({ onBatchAdded }: { onBatchAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const {
    form,
    onSubmit,
    isLoading,
    isProductDetailLoading,
    products,
    branches,
    suppliers,
    variants
  } = useCreateBatch({
    onSuccess: () => {
      setOpen(false);
      if (onBatchAdded) onBatchAdded();
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Plus className="size-4" />
          New Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-sm border-none shadow-2xl overflow-hidden p-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Package className="size-6 text-primary" />
            Establish New Batch
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Register a specific stock batch with unique pricing and expiry tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Product Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                   <Package className="size-3" /> Identity & Location
                </div>
                
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage Branch</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="Select Branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch: any) => (
                            <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Product</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="Product catalog" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name_product}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productVariantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specific Variant</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!variants.length || isProductDetailLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50 border-slate-200">
                             <SelectValue placeholder={isProductDetailLoading ? "Loading variants..." : "Choose variant"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {variants.map((v: any) => (
                            <SelectItem key={v.id} value={v.id}>{v.name_variant}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Batch & Supplier Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                   <Truck className="size-3" /> Logistics & Source
                </div>

                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch Identifier</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. BTC-2024-001" {...field} className="bg-slate-50/50 border-slate-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor/Supplier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-50/50 border-slate-200">
                            <SelectValue placeholder="Optional supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>{s.name || s.name_supplier}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="initialQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-slate-50/50 border-slate-200 font-bold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                    <FormField
                      control={form.control}
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost/Unit</FormLabel>
                          <FormControl>
                            <div className="relative">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-bold">$</div>
                               <Input type="number" step="0.01" {...field} className="bg-slate-50/50 border-slate-200 pl-8 font-mono" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 bg-slate-50/30 -mx-8 px-8">
               {/* Dates Section */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70">
                    <CalendarIcon className="size-3" /> Life Cycle Dates
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expiration Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-white border-slate-200 pr-2",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>

               <div className="flex items-end pb-1">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-11 rounded-xl shadow-xl shadow-primary/30 font-black uppercase tracking-widest text-[11px]"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Receipt className="mr-2 size-4 text-white" />
                    )}
                    {isLoading ? "Saving Batch..." : "Commission Batch"}
                  </Button>
               </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
