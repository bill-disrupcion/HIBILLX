
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
import { initiateDeposit, type DepositDetails } from '@/services/broker-api';
import { Loader2, Landmark, CreditCard, Banknote } from 'lucide-react'; // Added icons

interface DepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const depositFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }).min(5, { message: "Minimum deposit is $5."}),
  method: z.enum(["bank_transfer", "card"], {
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

    const depositDetails: DepositDetails = {
      amount: values.amount,
      method: values.method,
      currency: values.currency,
    };

    try {
      const result = await initiateDeposit(depositDetails);
      console.log("Deposit initiation result:", result);
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
        description: error.message || "Could not initiate deposit. Please try again.",
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
            Add funds to your HIBLLX account. All transactions are secure.
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
                                <Landmark className="mr-2 h-4 w-4 text-muted-foreground" /> Bank Transfer (ACH)
                            </div>
                          </SelectItem>
                          <SelectItem value="card">
                             <div className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> Credit/Debit Card
                             </div>
                          </SelectItem>
                          {/* <SelectItem value="crypto" disabled>Crypto (Coming Soon)</SelectItem> */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Placeholder for Method-Specific Fields */}
                 {form.watch("method") === "card" && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                        <p className="text-sm font-medium">Card Details (Simulation)</p>
                        <Input placeholder="Card Number (xxxx xxxx xxxx xxxx)" disabled={isSubmitting} />
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="MM/YY" disabled={isSubmitting} />
                            <Input placeholder="CVC" disabled={isSubmitting} />
                        </div>
                        <p className="text-xs text-muted-foreground">This is a simulated interface. No real card details are processed.</p>
                    </div>
                 )}
                 {form.watch("method") === "bank_transfer" && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                         <p className="text-sm font-medium">Bank Transfer (Simulation)</p>
                         <Button variant="outline" className="w-full" disabled={isSubmitting}>
                             <Landmark className="mr-2 h-4 w-4" /> Connect Bank via Plaid (Simulated)
                         </Button>
                         <p className="text-xs text-muted-foreground">In a real application, this would integrate with a service like Plaid to securely link bank accounts.</p>
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
