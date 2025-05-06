// @ts-nocheck
'use client';

import React, { useState, useCallback } from 'react'; // Added useCallback
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Bot, DollarSign, TrendingUp, Zap, Info, BrainCircuit, Search, Check } from 'lucide-react'; // Added Check
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import
// Import the financial knowledge flow
import { getFinancialKnowledge, FinancialKnowledgeInput, FinancialKnowledgeOutput } from '@/ai/flows/financial-knowledge-flow';

// Define strategy structure
interface Strategy {
  id: string;
  title: string;
  description: string;
  minInvestment: number;
  icon: React.ElementType; // Add icon component type
}

// Define available strategies
const availableStrategies: Strategy[] = [
  {
    id: 'conservative',
    title: 'Conservative Growth',
    description: 'Focuses on stable, low-volatility assets like large-cap stocks and bonds. Aims for steady, modest returns with minimal risk. Suitable for long-term capital preservation.',
    minInvestment: 20,
    icon: DollarSign, // Example icon
  },
  {
    id: 'balanced',
    title: 'Balanced Approach',
    description: 'Mixes growth stocks, dividend stocks, and bonds to balance risk and reward. Aims for moderate growth with moderate volatility. Suitable for medium to long-term goals.',
    minInvestment: 50,
    icon: TrendingUp, // Example icon
  },
  {
    id: 'tech_focus',
    title: 'Aggressive Tech Focus',
    description: 'Concentrates on high-growth technology stocks and emerging tech trends. Higher potential returns come with increased volatility. Suitable for investors with high risk tolerance.',
    minInvestment: 100,
    icon: Zap, // Example icon
  },
   {
    id: 'dividend',
    title: 'Dividend Income',
    description: 'Invests in established companies with a history of paying consistent dividends. Focuses on generating regular income alongside potential capital appreciation. Lower volatility than pure growth strategies.',
    minInvestment: 30,
    icon: DollarSign, // Example icon (replace as needed)
  },
   {
    id: 'global',
    title: 'Global Diversification',
    description: 'Spreads investments across different countries and regions (developed and emerging markets). Reduces reliance on any single economy. Can include international stocks and bonds.',
    minInvestment: 75,
    icon: TrendingUp, // Example icon (replace as needed)
  },
];


// Placeholder component for strategy details
const StrategyDetail = ({ title, description, minInvestment, icon: Icon }: Strategy) => (
  <div className="p-4 border rounded-md bg-muted/50">
    <h4 className="font-semibold text-md mb-1 flex items-center">
       {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />} {title}
    </h4>
    <p className="text-sm text-muted-foreground mb-2">{description}</p>
    <p className="text-xs font-medium">
      Minimum Investment: <span className="text-primary">${minInvestment}</span>
    </p>
  </div>
);

export default function BillXAgent() {
  const { toast } = useToast();
  const [isBillXEnabled, setIsBillXEnabled] = useState(false);
  const [automationLevel, setAutomationLevel] = useState<'strategy' | 'full'>('strategy'); // 'strategy' or 'full'
  const [selectedStrategyAmount, setSelectedStrategyAmount] = useState(20);
  const [fullAutomationAmount, setFullAutomationAmount] = useState(300); // Minimum for full automation
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]); // State for selected strategy IDs


  // State for AI Knowledge Hub
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  const handleToggleBillX = (enabled: boolean) => {
    if (enabled && automationLevel === 'full' && fullAutomationAmount < 300) {
        toast({
            title: "Minimum Investment Required",
            description: "Full account automation requires a minimum balance or allocation of $300.",
            variant: "destructive",
        });
        setIsBillXEnabled(false); // Keep it disabled
        return;
    }
     if (enabled && automationLevel === 'strategy' && selectedStrategyAmount < 20) {
        toast({
            title: "Minimum Investment Required",
            description: "Strategy-based automation requires a minimum investment of $20 per strategy.",
            variant: "destructive",
        });
         setIsBillXEnabled(false); // Keep it disabled
        return;
    }
    // Validation for strategy selection when enabling strategy mode
     if (enabled && automationLevel === 'strategy' && selectedStrategies.length === 0) {
         toast({
            title: "No Strategy Selected",
            description: "Please select at least one strategy before enabling strategy-based automation.",
            variant: "destructive",
        });
         setIsBillXEnabled(false); // Keep it disabled
         return;
     }


    setIsBillXEnabled(enabled);
    toast({
      title: `Bill X ${enabled ? 'Enabled' : 'Disabled'}`,
      description: enabled
        ? `AI agent is now managing your investments based on the selected mode.`
        : `AI agent is no longer managing your investments.`,
    });
    // TODO: Add API call to backend to actually enable/disable the agent
    console.log(`Bill X ${enabled ? 'enabled' : 'disabled'}. Mode: ${automationLevel}. Amount: ${automationLevel === 'full' ? fullAutomationAmount : selectedStrategyAmount}. Selected Strategies: ${selectedStrategies.join(', ')}`);
  };

  const handleAutomationLevelChange = (level: 'strategy' | 'full') => {
    // Validation when switching levels while enabled
    if (isBillXEnabled) {
        if (level === 'full' && fullAutomationAmount < 300) {
           toast({
                title: "Minimum Investment Required",
                description: "Switching to full automation requires a minimum of $300. Please adjust the amount or disable Bill X first.",
                variant: "destructive",
            });
            return;
        }
        if (level === 'strategy' && selectedStrategyAmount < 20) {
           toast({
                title: "Minimum Investment Required",
                description: "Switching to strategy automation requires a minimum of $20. Please adjust the amount or disable Bill X first.",
                variant: "destructive",
            });
            return;
        }
        if (level === 'strategy' && selectedStrategies.length === 0) {
             toast({
                title: "No Strategy Selected",
                description: "Switching to strategy mode requires at least one strategy to be selected. Please select strategies or disable Bill X first.",
                variant: "destructive",
            });
             return;
        }
    }

    setAutomationLevel(level);
     // If Bill X is already enabled, update the backend status immediately
    if (isBillXEnabled) {
         console.log(`Updating Bill X mode to: ${level}. Amount: ${level === 'full' ? fullAutomationAmount : selectedStrategyAmount}. Selected Strategies: ${selectedStrategies.join(', ')}`);
        // TODO: Add API call to update backend
         toast({
            title: "Automation Mode Updated",
            description: `Bill X is now set to ${level === 'full' ? 'Full Account Automation' : 'Strategy-Based Automation'}.`,
        });
    }
  };

   const handleStrategySelectionChange = useCallback((strategyId: string, checked: boolean) => {
        setSelectedStrategies(prev =>
            checked ? [...prev, strategyId] : prev.filter(id => id !== strategyId)
        );
        // Note: We don't update the backend here immediately, only when the "Update Selected Strategies" button is clicked.
   }, []); // No dependencies needed

   const handleUpdateStrategies = useCallback(() => {
       if (!isBillXEnabled) {
            toast({
                title: "Bill X Disabled",
                description: "Enable Bill X before updating strategies.",
                variant: "destructive"
            });
            return;
       }
        if (selectedStrategies.length === 0) {
             toast({
                title: "No Strategy Selected",
                description: "Please select at least one strategy to apply.",
                variant: "destructive"
            });
            return;
        }

       console.log("Updating selected strategies:", selectedStrategies);
       // TODO: Add API call to backend to save the selected strategies
       toast({
            title: "Strategies Updated",
            description: `Bill X will now use the selected strategies: ${selectedStrategies.join(', ')}.`,
       });
   }, [isBillXEnabled, selectedStrategies, toast]); // Dependencies


   const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAi(true);
    setAiResponse(null);
    setAiError(null);

    try {
      const input: FinancialKnowledgeInput = { query: aiQuery };
      const output: FinancialKnowledgeOutput = await getFinancialKnowledge(input);
      setAiResponse(output.explanation);

    } catch (err) { // Corrected catch block syntax
      console.error("AI Knowledge query failed:", err);
      setAiError(`Failed to get information. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoadingAi(false);
    }
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
       <header className="flex items-center justify-between pb-4 border-b">
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <Bot className="mr-3 h-6 w-6 text-primary" /> Bill X - Your AI Finance Pilot
            </h1>
            <div className="flex items-center space-x-2">
                <Label htmlFor="billx-enable" className={isBillXEnabled ? 'text-primary font-medium' : 'text-muted-foreground'}>
                    {isBillXEnabled ? 'Enabled' : 'Disabled'}
                </Label>
                <Switch
                    id="billx-enable"
                    checked={isBillXEnabled}
                    onCheckedChange={handleToggleBillX}
                    aria-label="Enable or disable Bill X AI agent"
                />
            </div>
       </header>

        {/* Automation Settings Card */}
        <Card className="bg-gradient-to-br from-card to-secondary/30">
            <CardHeader>
                <CardTitle>AI Automation Settings</CardTitle>
                <CardDescription>Configure how Bill X manages your investments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isBillXEnabled && (
                     <Alert variant="default" className="border-primary/50 bg-primary/5">
                        <Info className="h-4 w-4 !text-primary" />
                        <AlertTitle>Bill X is Currently Disabled</AlertTitle>
                        <AlertDescription>
                            Enable the switch above to allow Bill X to start managing your investments based on your chosen settings.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Automation Level Selection */}
                 <div className="space-y-3">
                    <Label className="text-base font-medium">Choose Automation Level</Label>
                     <div className="flex flex-col sm:flex-row gap-4">
                         <Button
                            variant={automationLevel === 'strategy' ? 'default' : 'outline'}
                            onClick={() => handleAutomationLevelChange('strategy')}
                            className="flex-1 justify-start text-left h-auto p-4"
                         >
                             <div className="flex items-center">
                                <Zap className="w-5 h-5 mr-3" />
                                <div>
                                    <p className="font-semibold">Strategy-Based Automation</p>
                                    <p className="text-xs text-muted-foreground mt-1">Bill X diversifies based on a chosen strategy. Ideal for focused goals.</p>
                                </div>
                            </div>
                        </Button>
                         <Button
                            variant={automationLevel === 'full' ? 'default' : 'outline'}
                            onClick={() => handleAutomationLevelChange('full')}
                            className="flex-1 justify-start text-left h-auto p-4"
                        >
                             <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-3" />
                                <div>
                                    <p className="font-semibold">Full Account Automation</p>
                                    <p className="text-xs text-muted-foreground mt-1">Bill X dynamically diversifies across multiple strategies for maximum optimization.</p>
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Investment Amount Settings */}
                {automationLevel === 'strategy' && (
                    <div className="space-y-3 p-4 border rounded-md">
                        <Label htmlFor="strategy-amount" className="font-medium flex items-center">
                            Investment per Strategy
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <Info className="h-3 w-3 text-muted-foreground ml-1.5 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Set the amount Bill X should allocate for each selected strategy.</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        </Label>
                         <div className="flex items-center space-x-4">
                            <Slider
                                id="strategy-amount"
                                min={20}
                                max={1000} // Adjust max as needed
                                step={10}
                                value={[selectedStrategyAmount]}
                                onValueChange={(value) => setSelectedStrategyAmount(value[0])}
                                className="flex-1"
                                disabled={isBillXEnabled} // Disable slider when enabled
                                aria-label="Investment amount per strategy"
                            />
                            <span className="font-semibold text-primary w-20 text-right">${selectedStrategyAmount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum $20 required per strategy.</p>
                         {isBillXEnabled && <p className="text-xs text-destructive">Disable Bill X to change the amount.</p>}
                    </div>
                )}

                 {automationLevel === 'full' && (
                    <div className="space-y-3 p-4 border rounded-md">
                        <Label htmlFor="full-amount" className="font-medium flex items-center">
                            Full Automation Allocation
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <Info className="h-3 w-3 text-muted-foreground ml-1.5 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Set the total amount Bill X should manage across all strategies.</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        </Label>
                         <div className="flex items-center space-x-4">
                            <Slider
                                id="full-amount"
                                min={300}
                                max={50000} // Adjust max as needed
                                step={100}
                                value={[fullAutomationAmount]}
                                onValueChange={(value) => setFullAutomationAmount(value[0])}
                                className="flex-1"
                                disabled={isBillXEnabled} // Disable slider when enabled
                                aria-label="Total amount for full automation"
                            />
                             <span className="font-semibold text-primary w-24 text-right">${fullAutomationAmount}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum $300 required for full account automation.</p>
                         {isBillXEnabled && <p className="text-xs text-destructive">Disable Bill X to change the amount.</p>}
                    </div>
                )}

            </CardContent>
        </Card>

        {/* AI Strategies Section */}
        <Card>
            <CardHeader>
                <CardTitle>Bill X Strategies</CardTitle>
                <CardDescription>Explore the AI-driven strategies Bill X can employ.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                     {availableStrategies.map((strategy) => (
                         <AccordionItem key={strategy.id} value={strategy.id}>
                            <AccordionTrigger>{strategy.title}</AccordionTrigger>
                            <AccordionContent>
                                <StrategyDetail {...strategy} />
                            </AccordionContent>
                        </AccordionItem>
                     ))}
                </Accordion>

                 {/* Strategy Selection UI (if automationLevel === 'strategy') */}
                 {automationLevel === 'strategy' && (
                    <div className="mt-6 p-4 border rounded-md bg-background">
                        <h3 className="text-lg font-semibold mb-3">Select Strategies for Automation</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Choose one or more strategies for Bill X to manage with the allocated amount (${selectedStrategyAmount} per strategy).
                        </p>
                         {/* Checkbox group for strategy selection */}
                        <div className="space-y-3">
                             {availableStrategies.map((strategy) => (
                                <div key={strategy.id} className="flex items-center space-x-3">
                                     <Checkbox
                                        id={`strategy-${strategy.id}`}
                                        checked={selectedStrategies.includes(strategy.id)}
                                        onCheckedChange={(checked) => handleStrategySelectionChange(strategy.id, !!checked)}
                                        // Disable checkbox if BillX is enabled to prevent mid-operation changes easily
                                        // Or allow changes and require hitting "Update"
                                        // disabled={isBillXEnabled}
                                        aria-labelledby={`label-strategy-${strategy.id}`}
                                    />
                                    <Label
                                        htmlFor={`strategy-${strategy.id}`}
                                        id={`label-strategy-${strategy.id}`}
                                        className="font-normal cursor-pointer"
                                    >
                                        {strategy.title} <span className="text-xs text-muted-foreground">(Min: ${strategy.minInvestment})</span>
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <Button
                            className="mt-4"
                            onClick={handleUpdateStrategies}
                            disabled={!isBillXEnabled || selectedStrategies.length === 0} // Disable if not enabled or no strategy selected
                        >
                           {isBillXEnabled ? <><Check className="mr-2 h-4 w-4" /> Update Selected Strategies</> : 'Enable Bill X to Select'}
                        </Button>
                         {isBillXEnabled && <p className="text-xs text-muted-foreground mt-2">Click "Update Selected Strategies" to apply changes.</p>}
                         {!isBillXEnabled && <p className="text-xs text-muted-foreground mt-2">Enable Bill X to apply selected strategies.</p>}
                    </div>
                )}
            </CardContent>
        </Card>

         {/* AI Knowledge Hub Section - Integrated */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BrainCircuit className="mr-2 h-5 w-5 text-primary" /> Ask Bill X
                </CardTitle>
                <CardDescription>Leverage Bill X's financial knowledge. Ask anything!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex space-x-2">
                    <Input
                        type="text"
                        placeholder="E.g., Explain dollar-cost averaging..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                        disabled={loadingAi}
                    />
                    <Button onClick={handleAiQuery} disabled={loadingAi || !aiQuery.trim()}>
                        {loadingAi ? <Skeleton className="h-5 w-5 rounded-full animate-spin" /> : <Search className="h-5 w-5" />}
                         <span className="ml-2 sm:inline hidden">Ask</span> {/* Hide text on small screens */}
                    </Button>
                 </div>

                {aiError && (
                    <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{aiError}</AlertDescription>
                    </Alert>
                )}

                 {loadingAi && (
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                 )}

                 {aiResponse && !loadingAi && (
                    <div className="pt-4 border-t mt-4 max-h-60 overflow-y-auto pr-2"> {/* Added scroll */}
                         <h4 className="font-semibold mb-2">Bill X Says:</h4>
                         {/* Using div with whitespace-pre-wrap for better formatting */}
                         <div className="text-sm whitespace-pre-wrap">{aiResponse}</div>
                    </div>
                )}
            </CardContent>
        </Card>

    </div>
  );
}
