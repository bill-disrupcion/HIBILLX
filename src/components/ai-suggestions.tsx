
'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2, ShoppingCart, AlertTriangle } from 'lucide-react';
import { OrderDialog, type OrderDetails } from './order-dialog';
import { useToast } from '@/hooks/use-toast';

import { analyzeInvestmentOptions, AnalyzeInvestmentOptionsInput, AnalyzeInvestmentOptionsOutput } from '@/ai/flows/analyze-investment-options';
import { suggestTradingStrategies, SuggestTradingStrategiesInput, SuggestTradingStrategiesOutput } from '@/ai/flows/suggest-trading-strategies';
import { diversifyPortfolio, DiversifyPortfolioInput, DiversifyPortfolioOutput } from '@/ai/flows/diversify-portfolio';
import { submitOrder, Order } from '@/services/broker-api'; // submitOrder now requires real API
import { Skeleton } from '@/components/ui/skeleton';


type AiTask = 'analyze' | 'suggest' | 'diversify';
type AiResult = AnalyzeInvestmentOptionsOutput | SuggestTradingStrategiesOutput | DiversifyPortfolioOutput | null;

type RiskLevel = 'low' | 'medium' | 'high';
const validRiskLevels: RiskLevel[] = ['low', 'medium', 'high'];

export default function AiSuggestions() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<AiTask>('analyze');
  const [riskProfile, setRiskProfile] = useState<string>('moderate');
  const [financialGoals, setFinancialGoals] = useState<string>('long-term growth');
  const [investmentAmount, setInvestmentAmount] = useState<string>('10000');
  const [preferredInstruments, setPreferredInstruments] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult>(null);

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState<OrderDetails | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive investment amount.');
      setLoading(false);
      return;
    }

    const riskToleranceForSuggest = validRiskLevels.includes(riskProfile as RiskLevel)
        ? riskProfile as RiskLevel
        : 'medium';

    try {
      let aiResponse: AiResult = null;
      console.log(`Initiating AI Task: ${selectedTask}`);
      // These AI flow calls might depend on real data fetched within them (e.g., getInstruments)
      // Ensure those underlying API calls are also implemented or handle potential errors.
      switch (selectedTask) {
        case 'analyze':
          const analyzeInput: AnalyzeInvestmentOptionsInput = { riskProfile, financialGoals, investmentAmount: amount };
          aiResponse = await analyzeInvestmentOptions(analyzeInput);
          break;
        case 'suggest':
          const suggestInput: SuggestTradingStrategiesInput = {
            investmentAmount: amount,
            riskTolerance: riskToleranceForSuggest,
            preferredInstruments: preferredInstruments ? preferredInstruments.split(',').map(s => s.trim()).filter(s => s) : undefined,
          };
          aiResponse = await suggestTradingStrategies(suggestInput);
          break;
        case 'diversify':
          const diversifyInput: DiversifyPortfolioInput = { investmentAmount: amount, riskTolerance: riskProfile };
          aiResponse = await diversifyPortfolio(diversifyInput);
          break;
        default:
             throw new Error(`Unknown AI task selected: ${selectedTask}`);
      }
       console.log("AI Task completed successfully.");
      setResult(aiResponse);
    } catch (err: any) {
      console.error(`AI Task (${selectedTask}) failed:`, err);
      // Provide more specific error guidance if possible
      let detailedError = `Failed to generate suggestions: ${err.message || 'Please try again.'}`;
      if (err.message?.includes('API not configured') || err.message?.includes('not implemented')) {
           detailedError += ' Check API configurations in services/broker-api.ts and environment variables.';
       }
      setError(detailedError);
       setResult(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTask, riskProfile, financialGoals, investmentAmount, preferredInstruments, toast]);

   const handleInitiateOrder = useCallback((orderDetails: OrderDetails) => {
    console.log("Initiating order for:", orderDetails);
    // Check if submitOrder is likely implemented (conceptual check)
    if (!process.env.REAL_BROKER_API_KEY) {
        toast({
            variant: "destructive",
            title: "Broker API Not Configured",
            description: "Cannot place orders without configuring Broker API keys in environment variables.",
        });
        return;
    }
    setCurrentOrderDetails(orderDetails);
    setIsOrderDialogOpen(true);
  }, [toast]); // Added toast dependency

   const handleConfirmOrder = useCallback(async (order: Order) => {
    setIsOrderDialogOpen(false);
    toast({
       title: 'Submitting Order...',
       description: `${order.type.toUpperCase()} ${order.quantity} shares of ${order.ticker}`,
     });
     console.log("Submitting order:", order);
    try {
      // This now calls the potentially real (but maybe unimplemented) submitOrder
      const submittedOrder = await submitOrder(order);
      console.log("Order submitted response:", submittedOrder);
      toast({
        title: 'Order Submitted Successfully!',
        description: `Your order for ${order.ticker} (${submittedOrder.id || 'N/A'}) is ${submittedOrder.status || 'pending'}.`,
        variant: 'default',
      });
      // Optionally, trigger a refresh of portfolio data here
    } catch (err: any) {
      console.error('Order submission failed:', err);
      toast({
        title: 'Order Submission Failed',
        description: `Could not place order for ${order.ticker}. ${err.message || 'Ensure Broker API is implemented correctly.'}`,
        variant: 'destructive',
      });
    }
    setCurrentOrderDetails(null); // Clear details after submission attempt
   }, [toast]);

   // Extracted Result Rendering Logic (remains largely the same, but Buy button action now has implications)
   const RenderResultContent = useCallback(({ resultData, totalAmount }: { resultData: AiResult, totalAmount: number }) => {
    if (!resultData) return null;

    // Type guard for AnalyzeInvestmentOptionsOutput
    if ('investmentOptions' in resultData && Array.isArray(resultData.investmentOptions)) {
      return (
        <div className="space-y-4">
          <div>
             <h4 className="font-semibold mb-2">Investment Options:</h4>
             <ul className="space-y-3">
                {resultData.investmentOptions.map((opt, index) => {
                 const suggestedAmount = totalAmount * (opt.percentage / 100);
                 return (
                    <li key={`${opt.ticker}-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3 last:border-b-0">
                       <div className="flex-1">
                        <strong className="block">{opt.name} ({opt.ticker})</strong>
                        <span className="text-sm">Suggested Allocation: {opt.percentage}% (~${suggestedAmount.toFixed(0)})</span>
                        <p className="text-sm text-muted-foreground mt-1">{opt.reason}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInitiateOrder({ ticker: opt.ticker, initialOrderType: 'buy', suggestedAmount: suggestedAmount })}
                        title={`Buy ${opt.ticker}`}
                        className="w-full sm:w-auto flex-shrink-0"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                      </Button>
                    </li>
                 );
                })}
             </ul>
          </div>
           <div>
               <h4 className="font-semibold mb-2">Summary:</h4>
               <p className="text-sm whitespace-pre-wrap">{resultData.summary}</p>
           </div>
        </div>
      );
    }

    // Type guard for SuggestTradingStrategiesOutput
    if ('strategies' in resultData && Array.isArray(resultData.strategies)) {
       return (
        <div className="space-y-4">
           <div>
               <h4 className="font-semibold mb-2">Suggested Strategies:</h4>
               <div className="space-y-4">
                 {resultData.strategies.map((strat, index) => (
                   <div key={`${strat.name}-${index}`} className="p-3 border rounded-md bg-muted/30">
                     <div className="flex justify-between items-center mb-1">
                        <h5 className="font-medium">{strat.name}</h5>
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize border ${
                            strat.riskLevel === 'high' ? 'border-red-500/50 bg-red-500/10 text-red-600' :
                            strat.riskLevel === 'medium' ? 'border-orange-500/50 bg-orange-500/10 text-orange-600' :
                            'border-green-500/50 bg-green-500/10 text-green-600'
                        }`}>{strat.riskLevel} risk</span>
                     </div>
                     <p className="text-sm text-muted-foreground mb-1">{strat.description}</p>
                     <p className="text-sm">Instruments: <span className="font-mono text-xs bg-muted px-1 rounded">{strat.instruments.join(', ')}</span></p>
                     <p className="text-sm">Est. Return: <span className="font-semibold">{(strat.expectedReturn || 0).toFixed(2)}%</span></p>
                      <Button size="sm" variant="outline" className="mt-2" disabled>Execute Strategy (Needs Impl)</Button>
                   </div>
                 ))}
               </div>
           </div>
           <div>
                <h4 className="font-semibold mb-2">Summary:</h4>
                <p className="text-sm whitespace-pre-wrap">{resultData.summary}</p>
            </div>
        </div>
      );
    }

     // Type guard for DiversifyPortfolioOutput
     if ('portfolioAllocation' in resultData && typeof resultData.portfolioAllocation === 'object') {
      const allocation = resultData.portfolioAllocation;
      return (
        <div className="space-y-4">
           <div>
               <h4 className="font-semibold mb-2">Diversification Strategy Explained:</h4>
               <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{resultData.strategyExplanation}</p>
           </div>
           <div>
               <h4 className="font-semibold mb-2">Recommended Allocation:</h4>
                {Object.keys(allocation).length > 0 ? (
                   <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(allocation).map(([asset, percentage]) => (
                          <li key={asset}>
                            <strong>{asset}:</strong> {percentage.toFixed(2)}%
                          </li>
                        ))}
                   </ul>
                ) : (
                     <p className="text-sm text-muted-foreground italic">No specific allocation provided.</p>
                )}
                  <Button size="sm" variant="outline" className="mt-3" disabled>Apply Diversification (Needs Impl)</Button>
            </div>
        </div>
      );
    }

     console.warn("Unexpected AI result format:", resultData);
    return <p className="text-destructive">Could not display the AI result due to an unexpected format.</p>;
   }, [handleInitiateOrder]);


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
             <Wand2 className="mr-2 h-5 w-5 text-primary" /> AI Finance Pilot Suggestions
          </CardTitle>
          <CardDescription>
            Leverage AI to analyze options, suggest strategies, or diversify your portfolio. Requires API setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Selection */}
          <div className="space-y-2">
            <Label htmlFor="ai-task">Select AI Task</Label>
            <Select value={selectedTask} onValueChange={(value) => setSelectedTask(value as AiTask)} disabled={loading}>
              <SelectTrigger id="ai-task" aria-label="Select AI task">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="analyze">Analyze Investment Options</SelectItem>
                <SelectItem value="suggest">Suggest Trading Strategies</SelectItem>
                <SelectItem value="diversify">Diversify Portfolio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Common Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="risk-profile">Risk Profile / Tolerance</Label>
              <Select value={riskProfile} onValueChange={setRiskProfile} disabled={loading}>
                <SelectTrigger id="risk-profile" aria-label="Select risk profile">
                  <SelectValue placeholder="Select risk profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (Low Risk)</SelectItem>
                  <SelectItem value="moderate">Moderate (Medium Risk)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (High Risk)</SelectItem>
                   <SelectItem value="low">Low</SelectItem>
                   <SelectItem value="medium">Medium</SelectItem>
                   <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="investment-amount">Investment Amount ($)</Label>
              <Input
                id="investment-amount"
                type="number"
                placeholder="e.g., 10000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                min="1"
                disabled={loading}
                aria-label="Investment amount in dollars"
              />
            </div>
          </div>

          {/* Task Specific Inputs */}
          {selectedTask === 'analyze' && (
            <div className="space-y-2">
              <Label htmlFor="financial-goals">Financial Goals</Label>
              <Textarea
                id="financial-goals"
                placeholder="e.g., Retirement savings in 20 years, buy a house in 5 years, short-term gains"
                value={financialGoals}
                onChange={(e) => setFinancialGoals(e.target.value)}
                disabled={loading}
                rows={3}
                aria-label="Describe your financial goals"
              />
            </div>
          )}

          {selectedTask === 'suggest' && (
            <div className="space-y-2">
              <Label htmlFor="preferred-instruments">Preferred Instruments (Optional)</Label>
              <Input
                id="preferred-instruments"
                placeholder="Comma-separated tickers, e.g., AAPL, GOOGL, VOO"
                value={preferredInstruments}
                onChange={(e) => setPreferredInstruments(e.target.value)}
                disabled={loading}
                aria-label="Optional preferred stock tickers, comma separated"
              />
               <p className="text-xs text-muted-foreground">Leave blank for AI to consider available instruments (requires API).</p>
            </div>
          )}

          {/* Action Button */}
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Generating...' : 'Generate Suggestions'}
          </Button>

            {/* Error Display */}
           {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Generation Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}


          {/* Result Display Area */}
           <div className="pt-6 border-t">
             {loading ? (
                 <div className="space-y-4">
                     <Skeleton className="h-6 w-1/3 mb-2" />
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-4/5" />
                      <Skeleton className="h-6 w-1/4 mt-4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                 </div>
             ) : result ? (
                 <>
                     <h3 className="text-lg font-semibold mb-3">AI Generated Result:</h3>
                     <div className="p-4 bg-muted/50 rounded-md border">
                         <RenderResultContent resultData={result} totalAmount={parseFloat(investmentAmount) || 0} />
                     </div>
                 </>
             ) : !error ? (
                 <p className="text-center text-muted-foreground py-4">Enter details and click "Generate" for AI insights (requires API setup).</p>
             ) : null /* Error is shown above */ }
           </div>
        </CardContent>
      </Card>

       {/* Order Dialog - Now relies on potentially real getMarketData and submitOrder */}
        <OrderDialog
            isOpen={isOrderDialogOpen}
            onOpenChange={setIsOrderDialogOpen}
            orderDetails={currentOrderDetails}
            onConfirmOrder={handleConfirmOrder}
        />
    </>
  );
}
