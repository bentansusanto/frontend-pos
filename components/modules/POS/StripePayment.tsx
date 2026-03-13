"use client";

import { Button } from "@/components/ui/button";
import {
  PaymentElement,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { toast } from "sonner";

interface StripePaymentProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

export const StripePayment = ({ clientSecret, onSuccess, onCancel }: StripePaymentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is required by Stripe, but since we are using webhook
        // and manual verification, we can point it back to the POS page.
        return_url: `${window.location.origin}/dashboard/pos/new-order`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      onSuccess(paymentIntent.id);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        <div className="min-h-[200px]">
          <PaymentElement onReady={() => console.log("Stripe Element Ready")} />
        </div>
      </div>
      <div className="flex gap-2 pt-4 mt-6 border-t sticky bottom-0 bg-background pb-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
};
