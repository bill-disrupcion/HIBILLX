
'use client';

import React, { useState } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { initiateDeposit, type DepositDetails, type TransactionStatus } from '@/services/broker-api';
import { Loader2, Landmark, CreditCard, Banknote } from 'lucide-react'; // Added icons

interface DepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const depositFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }).min(5, { message: "Minimum deposit is $5."}),
  method: z.enum(["bank_transfer", "card"], { // Removed "crypto" as backend call needed first
    required_error: "Please select a deposit method.",
  }),
  currency: z.literal("USD", { // Currently only supporting USD
    errorMap: () => ({ message: "Only USD deposits are currently supported." }),
  }),
});

type DepositFormValues = z.infer<typeof depositFormSchema>;

export function DepositDialog({ isOpen, onOpenChange }: DepositDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      amount: 50, // Default amount
      method: undefined,
      currency: "USD",
    },
  });

  async function onSubmit(values: DepositFormValues) {
    setIsSubmitting(true);
    console.log("Deposit form values:", values);

    // IMPORTANT: This function now requires a secure backend endpoint.
    // The frontend should NOT handle payment processing directly.
    // The 'initiateDeposit' function in broker-api.ts should call your backend.
    const depositDetails: DepositDetails = {
      amount: values.amount,
      method: values.method,
      currency: values.currency,
      // Add any other necessary details from form/user state (e.g., payment token from Stripe/Plaid)
    };

    try {
      // This call now attempts to reach your backend via broker-api.ts
      const result: TransactionStatus = await initiateDeposit(depositDetails);
      console.log("Deposit initiation result from backend:", result);
      toast({
        title: "Deposit Initiated",
        description: `Your deposit of $${values.amount} (${values.method}) is ${result.status}. Transaction ID: ${result.transactionId}`,
      });
      form.reset(); // Reset form on success
      onOpenChange(false); // Close dialog on success
    } catch (error: any) {
      console.error("Deposit initiation failed:", error);
      toast({
        variant: "destructive",
        title: "Deposit Failed",
        description: error.message || "Could not initiate deposit. Please ensure your backend is configured and running, or try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Add funds to your HIBLLX account. Requires backend setup for real transactions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                         <div className="relative">
                           <Banknote className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                            type="number"
                            placeholder="e.g., 100"
                            min="5"
                            step="1"
                            className="pl-8" // Add padding for icon
                            disabled={isSubmitting}
                            {...field}
                            />
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Method */}
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bank_transfer">
                            <div className="flex items-center">
                                <Landmark className="mr-2 h-4 w-4 text-muted-foreground" /> Bank Transfer (via Plaid/Backend)
                            </div>
                          </SelectItem>
                          <SelectItem value="card">
                             <div className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> Credit/Debit Card (via Stripe/Backend)
                             </div>
                          </SelectItem>
                          {/* <SelectItem value="crypto" disabled>Crypto (Coming Soon)</SelectItem> */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Placeholder for Method-Specific UI Elements (e.g., Stripe Elements, Plaid Link) */}
                 {form.watch("method") === "card" && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                        <p className="text-sm font-medium">Card Details (Requires Integration)</p>
                        {/*
                         Replace this with your actual payment processor integration (e.g., Stripe Elements)
                         This component will securely collect card details and generate a token.
                         <YourStripeElementComponent />
                        */}
                         <Input placeholder="Card Number (Integration Needed)" disabled />
                         <div className="grid grid-cols-2 gap-2">
                             <Input placeholder="MM/YY" disabled />
                             <Input placeholder="CVC" disabled />
                         </div>
                        <p className="text-xs text-muted-foreground">Integrate with a payment processor like Stripe here.</p>
                    </div>
                 )}
                 {form.watch("method") === "bank_transfer" && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                         <p className="text-sm font-medium">Bank Transfer (Requires Integration)</p>
                         {/*
                          Replace this with your Plaid Link integration button/component.
                          This component handles linking the bank account securely.
                          <YourPlaidLinkComponent onPlaidSuccess={(publicToken, metadata) => { ... }} />
                         */}
                         <Button variant="outline" className="w-full" disabled>
                             <Landmark className="mr-2 h-4 w-4" /> Connect Bank via Plaid (Integration Needed)
                         </Button>
                         <p className="text-xs text-muted-foreground">Integrate with Plaid Link or similar service here.</p>
                    </div>
                 )}


                <DialogFooter>
                  <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Processing...' : 'Confirm Deposit'}
                  </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
