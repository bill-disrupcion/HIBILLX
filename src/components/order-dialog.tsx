
'use client';

import React, { useState, useEffect } from 'react';
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
import { getMarketData, type MarketData, type Order } from '@/services/broker-api'; // getMarketData is now real
import { Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

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
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loadingMarketData, setLoadingMarketData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderDetails) {
      setError(null);
      setQuantity('');
      setMarketData(null);
      setLoadingMarketData(true);
      setOrderType(orderDetails.initialOrderType || 'buy');

      const fetchPrice = async () => {
        try {
          // This now attempts a real API call via broker-api.ts
          const data = await getMarketData(orderDetails.ticker);
          setMarketData(data);

          if (orderDetails.suggestedAmount && data.price > 0) {
             const suggestedQuantity = Math.floor(orderDetails.suggestedAmount / data.price);
             if (suggestedQuantity > 0) {
                setQuantity(suggestedQuantity.toString());
             }
          }

        } catch (err: any) {
          console.error("Failed to fetch market data:", err);
          // Provide specific error message if API isn't set up
           let errorMsg = `Failed to fetch current price for ${orderDetails.ticker}.`;
           if (err.message?.includes('API not configured') || err.message?.includes('not implemented')) {
                errorMsg += ' Check API configurations.';
           } else {
                errorMsg += ` ${err.message || ''}`;
           }
          setError(errorMsg);
        } finally {
          setLoadingMarketData(false);
        }
      };
      fetchPrice();
    }
  }, [isOpen, orderDetails]);

  const handleConfirm = () => {
    setError(null); // Clear previous errors before validating again
    const numQuantity = parseInt(quantity);
    if (!orderDetails) {
      setError('Order details missing.');
      return;
    }
    if (!marketData) {
        // Don't allow confirm if market data couldn't be loaded
        setError('Cannot confirm order without current market price.');
        return;
    }
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    const order: Order = {
      ticker: orderDetails.ticker,
      quantity: numQuantity,
      type: orderType,
      // In a real app, add order price type (market, limit), limit price, etc.
       orderPriceType: 'market', // Default to market for simplicity
    };
    onConfirmOrder(order);
  };

  // Calculate estimated cost only if market data and quantity are valid
   const estimatedCost = (marketData && marketData.price > 0 && quantity && parseInt(quantity) > 0)
     ? (parseInt(quantity) * marketData.price).toFixed(2)
     : '0.00';


   const formatCurrency = (value: number | string | undefined) => {
    const numValue = Number(value);
     if (isNaN(numValue)) return '$--.--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue);
  };


  if (!orderDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place Order for {orderDetails.ticker}</DialogTitle>
          <DialogDescription>
            Confirm the details for your {orderType} order.
            {loadingMarketData ? (
                <Skeleton className="h-4 w-32 mt-1" />
            ) : marketData ? (
                <span className="block mt-1"> Current Price: {formatCurrency(marketData.price)}</span>
            ) : error ? (
                 <span className="block mt-1 text-destructive text-xs">{error}</span>
            ) : null }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           {/* Order Type */}
           <div className="space-y-2">
                <Label>Order Type</Label>
                 <RadioGroup value={orderType} onValueChange={(value: 'buy' | 'sell') => setOrderType(value)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="buy" id="r-buy" />
                        <Label htmlFor="r-buy">Buy</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sell" id="r-sell" />
                        <Label htmlFor="r-sell">Sell</Label>
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
              placeholder="Number of shares"
              min="1"
              disabled={loadingMarketData || !marketData} // Disable if loading or if market data failed
            />
          </div>

          {/* Estimated Cost */}
           <div className="space-y-1">
             <Label>Estimated Cost/Proceeds</Label>
             {loadingMarketData ? (
                 <Skeleton className="h-6 w-24" />
             ) : error ? (
                  <p className="text-sm text-muted-foreground italic">Cannot estimate cost (price unavailable).</p>
             ) : (
                <p className="text-lg font-semibold">{formatCurrency(estimatedCost)}</p>
             )}
             <p className="text-xs text-muted-foreground">Based on current market price. Execution price may vary.</p>
           </div>


          {error && !loadingMarketData && ( // Show specific error if price fetch failed, but not while loading
               <p className="text-sm text-destructive flex items-center">
                   <AlertTriangle className="h-4 w-4 mr-1" /> {error}
               </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={loadingMarketData || !marketData || !quantity || parseInt(quantity) <= 0 || !!error} // Disable if loading, no data, invalid qty, or price error
          >
             {loadingMarketData && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
            Confirm {orderType.charAt(0).toUpperCase() + orderType.slice(1)} Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
