

'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { getMarketData, type MarketData, type Order, ApiError, DataProviderError, ValidationError, BrokerConnectionError, AuthorizationError } from '@/services/broker-api'; // Import error types
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast


export interface OrderDetails {
  ticker: string;
  initialOrderType?: 'buy' | 'sell';
  suggestedAmount?: number; // Optional amount suggested by AI
}

interface OrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orderDetails: OrderDetails | null;
  onConfirmOrder: (order: Order) => void;
}

export function OrderDialog({ isOpen, onOpenChange, orderDetails, onConfirmOrder }: OrderDialogProps) {
  const { toast } = useToast(); // Initialize toast
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loadingMarketData, setLoadingMarketData] = useState(false);
  const [error, setError] = useState<string | null>(null); // Error state specific to this dialog

  // Helper function for currency formatting
   const formatCurrency = useCallback((value: number | string | undefined) => {
    const numValue = Number(value);
     if (isNaN(numValue)) return '$--.--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue);
  }, []);


  useEffect(() => {
    if (isOpen && orderDetails) {
      // Reset state when dialog opens
      setError(null);
      setQuantity('');
      setMarketData(null);
      setLoadingMarketData(true);
      setOrderType(orderDetails.initialOrderType || 'buy');

      const fetchPrice = async () => {
        try {
          // Validate ticker before API call
          if (!orderDetails.ticker || typeof orderDetails.ticker !== 'string') {
              throw new ValidationError("Invalid ticker provided for order.");
          }

          // This now attempts a real API call via broker-api.ts with error handling
          const data = await getMarketData(orderDetails.ticker);
          if (!data || typeof data.price !== 'number') {
             throw new Error("Received invalid market data format."); // Validate response structure
          }
          setMarketData(data);

          // Auto-fill quantity based on suggestion if valid price received
          if (orderDetails.suggestedAmount && data.price > 0) {
             const suggestedQuantity = Math.floor(orderDetails.suggestedAmount / data.price);
             if (suggestedQuantity > 0) {
                setQuantity(suggestedQuantity.toString());
             }
          }

        } catch (err: any) {
          console.error("Failed to fetch market data:", err);
          let errorMsg = `Failed to fetch price for ${orderDetails.ticker}.`;
          if (err instanceof ValidationError) {
              errorMsg = `Validation Error: ${err.message}`;
          } else if (err instanceof DataProviderError) {
              errorMsg = `Data Error: ${err.message}. Check API status or ticker validity.`;
          } else if (err instanceof ApiError) {
              errorMsg = `API Error: ${err.message}.`;
          } else if (err instanceof BrokerConnectionError) {
              errorMsg = `Broker Connection Error: ${err.message}`;
          } else if (err instanceof AuthorizationError) {
              errorMsg = `Authorization Error: ${err.message}`;
          } else {
              errorMsg += ` ${err.message || 'Unknown error.'}`;
          }
          setError(errorMsg); // Set error state for the dialog
          toast({ // Also show a toast for visibility
              variant: "destructive",
              title: "Market Data Error",
              description: errorMsg,
          });
        } finally {
          setLoadingMarketData(false);
        }
      };
      fetchPrice();
    }
  }, [isOpen, orderDetails, toast]); // Added toast to dependency array

  const handleConfirm = () => {
    // Clear previous dialog error before validating again
    setError(null);
    let validationError = null;

    if (!orderDetails) {
      validationError = 'Order details missing.';
    } else if (!marketData && !loadingMarketData) { // Check if data is loaded *and* not loading
      validationError = 'Cannot confirm order without current market price.';
    } else {
        const numQuantity = parseInt(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
          validationError = 'Please enter a valid positive quantity.';
        } else {
             // Add further validation if needed (e.g., check against available funds)
        }
    }

    if (validationError) {
      setError(validationError); // Show validation error in the dialog
      return;
    }

    // If validation passes, create and confirm the order
    const numQuantity = parseInt(quantity);
    const order: Order = {
      ticker: orderDetails!.ticker, // We know orderDetails is not null here
      quantity: numQuantity,
      type: orderType,
      orderPriceType: 'market', // Default to market for simplicity
    };
    onConfirmOrder(order); // This function should handle its own try/catch for submission errors
  };

  // Calculate estimated cost only if market data and quantity are valid
   const estimatedCost = (marketData && marketData.price > 0 && quantity && parseInt(quantity) > 0)
     ? (parseInt(quantity) * marketData.price)
     : 0;


  if (!orderDetails) return null; // Don't render if no details

  const isConfirmDisabled = loadingMarketData || !marketData || !!error || !quantity || parseInt(quantity) <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place Order for {orderDetails.ticker}</DialogTitle>
           {/* Moved dynamic price/loading state outside DialogDescription */}
           <div className="text-sm text-muted-foreground mt-1 h-5"> {/* Added fixed height to prevent layout shift */}
              {loadingMarketData ? (
                 <div className="space-y-1"><Skeleton className="h-4 w-32" /></div>
              ) : marketData ? (
                 <span className="block"> Current Price: {formatCurrency(marketData.price)}</span>
              ) : error ? (
                  <span className="block text-destructive text-xs font-medium">Price unavailable.</span>
              ) : null }
           </div>
           <DialogDescription>
            Confirm the details for your {orderType} order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           {/* Order Type */}
           <div className="space-y-2">
                <Label>Order Type</Label>
                 <RadioGroup value={orderType} onValueChange={(value: 'buy' | 'sell') => setOrderType(value)} disabled={loadingMarketData}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="buy" id="r-buy" aria-label="Buy"/>
                        <Label htmlFor="r-buy" className="cursor-pointer">Buy</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sell" id="r-sell" aria-label="Sell"/>
                        <Label htmlFor="r-sell" className="cursor-pointer">Sell</Label>
                    </div>
                </RadioGroup>
            </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Number of shares/contracts"
              min="1"
              step="1" // Assuming whole units for now
              disabled={loadingMarketData} // Disable only while loading price
              required
              aria-required="true"
              aria-invalid={!!error && error.includes('quantity')} // Indicate if error relates to quantity
            />
          </div>

          {/* Estimated Cost */}
           <div className="space-y-1">
             <Label>Estimated Cost/Proceeds</Label>
             {loadingMarketData ? (
                 <Skeleton className="h-6 w-24" />
             ) : !marketData ? ( // Check if marketData is truly null
                  <p className="text-sm text-muted-foreground italic">Cannot estimate cost (price unavailable).</p>
             ) : (
                <p className="text-lg font-semibold">{formatCurrency(estimatedCost)}</p>
             )}
             <p className="text-xs text-muted-foreground">Based on current market price. Execution price may vary.</p>
           </div>


          {/* Display Error within Dialog */}
          {error && (
               <p className="text-sm text-destructive flex items-center gap-1">
                   <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
               </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loadingMarketData}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled} // Use combined disabled state
            aria-disabled={isConfirmDisabled}
          >
             {loadingMarketData && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
            Confirm {orderType.charAt(0).toUpperCase() + orderType.slice(1)} Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
