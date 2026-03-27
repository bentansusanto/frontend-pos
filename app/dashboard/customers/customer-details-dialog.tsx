import { 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Globe, 
  Gem,
  StickyNote
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Customer } from "@/types/customer.type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CustomerDetailsDialogProps {
  customer: Customer;
}

export function CustomerDetailsDialog({ customer }: CustomerDetailsDialogProps) {
  const initials = customer.name
    ? customer.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "CU";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-xl border-none shadow-2xl">
        {/* Header with Background/Pattern */}
        <div className="bg-gradient-to-br from-primary/90 to-primary p-6 text-primary-foreground relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <User className="size-32 rotate-12" />
          </div>
          
          <div className="flex items-center gap-5 relative z-10">
            <Avatar className="h-20 w-20 border-4 border-primary-foreground/20 shadow-xl ring-2 ring-primary-foreground/10">
              <AvatarFallback className="text-2xl font-bold bg-primary-foreground text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-none hover:bg-primary-foreground/30 transition-all flex items-center gap-1.5 py-1 px-3">
                  <Gem className="size-3.5 fill-current" />
                  <span className="font-bold">{customer.loyalPoints} Points</span>
                </Badge>
                <div className="size-1 rounded-full bg-primary-foreground/40" />
                <span className="text-xs text-primary-foreground/80 font-medium">Customer since {new Date(customer.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-background">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Info Group */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
                    <Mail className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Email Address</p>
                    <p className="text-sm font-semibold truncate max-w-[160px]">{customer.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
                    <Phone className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Phone Number</p>
                    <p className="text-sm font-semibold">{customer.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Info Group */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                Location
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Address</p>
                    <p className="text-sm font-semibold line-clamp-1">{customer.address || "N/A"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{customer.city}, {customer.country}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-secondary/50 text-secondary-foreground">
                    <Globe className="size-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">City & Country</p>
                    <p className="text-sm font-semibold">{customer.city}, {customer.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="opacity-50" />

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-1">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span className="text-xs">First joined on <span className="font-bold text-foreground">{new Date(customer.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span></span>
             </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <StickyNote className="size-4" />
                <span className="text-xs italic">Ref: {customer.id.slice(0, 8)}</span>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
