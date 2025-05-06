
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
import { Loader2, Landmark, CreditCard, Banknote, ExternalLink } from 'lucide-react'; // Added ExternalLink

// Inline SVGs for Nequi, Daviplata, PayPal (simple placeholders)
const NequiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#FF00FF]" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM4.5 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-1z"/></svg>;
const DaviplataIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#E00000]" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM6 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V5h1v-.5a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 5 5V6H4v-.5a.5.5 0 0 1 .5-.5H6V4.5zm5 4.707l-3.5 3.5a.5.5 0 0 1-.707 0l-1.5-1.5a.5.5 0 1 1 .707-.707L7.5 11.293l3.146-3.147a.5.5 0 0 1 .708.708z"/></svg>;
const PayPalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-[#0070BA]" fill="currentColor" viewBox="0 0 16 16"><path d="M14.06 3.713c.124 1.07-.091 1.834-.31 2.533-.217.694-.502 1.286-.84 1.766-.34.474-.747.857-1.205 1.123-.46.269-.975.411-1.53.411H7.563c-.549 0-.994-.098-1.33-.294-.334-.196-.58-.48-.73-.844a.87.87 0 0 1-.239-1.187c.126-.32.347-.575.658-.75.31-.174.69-.26 1.12-.26h1.41c.186 0 .35-.04.49-.117a.53.53 0 0 0 .28-.31c.06-.118.09-.26.09-.424 0-.13-.02-.24-.06-.33a.44.44 0 0 0-.18-.216.7.7 0 0 0-.29-.132.88.88 0 0 0-.36-.051H7.47c-1.13 0-1.95-.42-2.46-1.25a2.8 2.8 0 0 1-.04-2.45 3.7 3.7 0 0 1 2.7-1.965C8.43 2.01 9.52 2 10.76 2c.49 0 .93.04 1.3.117.37.076.68.184.93.32.25.137.44.296.57.478.13.18.2.375.2.582 0 .126-.02.24-.06.34a.5.5 0 0 1-.18.227.69.69 0 0 1-.29.137.88.88 0 0 1-.36.05h-.5c-.18 0-.34.04-.49.117a.5.5 0 0 0-.28.31c-.06.117-.09.26-.09.424 0 .31.08.562.25.752.17.19.43.287.79.287h.28c.48 0 .89.16 1.23.478.34.318.54.74.6 1.26z"/></svg>;


interface DepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const depositFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }).min(5, { message: "Minimum deposit is $5."}),
  method: z.enum(["bank_transfer", "card", "nequi", "daviplata", "paypal"], { // Added new methods
    required_error: "Please select a deposit method.",
  }),
  currency: z.literal("USD", { // Currently only supporting USD, adjust if needed
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

    // IMPORTANT: This function requires a secure backend endpoint.
    // The frontend should NOT handle payment processing directly.
    const depositDetails: DepositDetails = {
      amount: values.amount,
      method: values.method,
      currency: values.currency,
      // Add any other necessary details from form/user state (e.g., payment token, transaction reference)
    };

    try {
      // This call attempts to reach your backend via broker-api.ts
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
                           <SelectItem value="card">
                             <div className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> Credit/Debit Card (via Stripe/Backend)
                             </div>
                          </SelectItem>
                          <SelectItem value="bank_transfer">
                            <div className="flex items-center">
                                <Landmark className="mr-2 h-4 w-4 text-muted-foreground" /> Bank Transfer (via Plaid/Backend)
                            </div>
                          </SelectItem>
                           <SelectItem value="paypal">
                              <div className="flex items-center">
                                 <PayPalIcon /> PayPal (via Backend)
                              </div>
                           </SelectItem>
                            <SelectItem value="nequi">
                               <div className="flex items-center">
                                 <NequiIcon /> Nequi (Colombia - via Backend)
                               </div>
                           </SelectItem>
                           <SelectItem value="daviplata">
                               <div className="flex items-center">
                                 <DaviplataIcon /> Daviplata (Colombia - via Backend)
                               </div>
                           </SelectItem>
                          {/* <SelectItem value="crypto" disabled>Crypto (Coming Soon)</SelectItem> */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Placeholder for Method-Specific UI Elements */}
                 {form.watch("method") === "card" && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                        <p className="text-sm font-medium">Card Details (Requires Integration)</p>
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
                         <Button variant="outline" className="w-full" disabled>
                             <Landmark className="mr-2 h-4 w-4" /> Connect Bank via Plaid (Integration Needed)
                         </Button>
                         <p className="text-xs text-muted-foreground">Integrate with Plaid Link or similar service here.</p>
                    </div>
                 )}
                 {form.watch("method") === "paypal" && (
                     <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                          <p className="text-sm font-medium">PayPal Checkout (Requires Integration)</p>
                          <Button variant="outline" className="w-full" disabled>
                              <PayPalIcon /> Proceed with PayPal (Integration Needed)
                          </Button>
                          <p className="text-xs text-muted-foreground">Integrate with PayPal checkout flow via backend.</p>
                     </div>
                 )}
                 {form.watch("method") === "nequi" && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                        <p className="text-sm font-medium">Nequi Deposit (Requires Integration)</p>
                        <Input placeholder="Nequi Phone Number" type="tel" disabled />
                        <Button variant="outline" className="w-full" disabled>
                            <NequiIcon /> Initiate Nequi Push (Integration Needed)
                        </Button>
                        <p className="text-xs text-muted-foreground">Requires backend integration with Nequi APIs.</p>
                    </div>
                 )}
                 {form.watch("method") === "daviplata" && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                        <p className="text-sm font-medium">Daviplata Deposit (Requires Integration)</p>
                        <Input placeholder="Daviplata Number/ID" disabled />
                        <Button variant="outline" className="w-full" disabled>
                            <DaviplataIcon /> Generate Daviplata Request (Integration Needed)
                        </Button>
                        <p className="text-xs text-muted-foreground">Requires backend integration with Daviplata APIs.</p>
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
