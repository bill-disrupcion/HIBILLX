
// @ts-nocheck
'use client';

import React, { useState, useCallback, useEffect } from 'react'; // Added useEffect
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
import { Bot, DollarSign, TrendingUp, Zap, Info, BrainCircuit, Search, Check, Landmark, BarChart, Scale } from 'lucide-react'; // Added Gov icons
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from "@/components/ui/checkbox";
import { getFinancialKnowledge, FinancialKnowledgeInput, FinancialKnowledgeOutput } from '@/ai/flows/financial-knowledge-flow';

// Define strategy structure relevant to governmental trading
interface Strategy {
  id: string;
  title: string;
  description: string;
  minInvestment: number; // Represents minimum allocation or risk unit
  icon: React.ElementType;
  riskProfile: 'Low' | 'Medium' | 'High'; // Add risk profile
}

// Define available strategies for governmental context
const availableStrategies: Strategy[] = [
  {
    id: 'yield_curve_positioning',
    title: 'Yield Curve Positioning',
    description: 'Strategically allocates across different maturities (e.g., 2yr, 5yr, 10yr, 30yr) based on predicted curve shifts. Aims to capture gains from steepening, flattening, or inversions.',
    minInvestment: 50, // Example allocation unit
    icon: BarChart,
    riskProfile: 'Medium',
  },
  {
    id: 'sovereign_spread_trading',
    title: 'Sovereign Spread Trading',
    description: 'Identifies relative value opportunities by trading spreads between bonds of different countries (e.g., US vs. Germany) based on macroeconomic divergence.',
    minInvestment: 100, // Higher complexity
    icon: Scale,
    riskProfile: 'Medium',
  },
  {
    id: 'inflation_protection',
    title: 'Inflation Protection Focus',
    description: 'Prioritizes inflation-linked bonds (e.g., TIPS) and short-duration instruments to mitigate inflation risk. Suitable for capital preservation in inflationary environments.',
    minInvestment: 30,
    icon: Landmark,
    riskProfile: 'Low',
  },
   {
    id: 'duration_management',
    title: 'Active Duration Management',
    description: 'Adjusts portfolio duration based on interest rate forecasts. Increases duration if rates are expected to fall, decreases if rates are expected to rise.',
    minInvestment: 75,
    icon: TrendingUp, // Can be up or down
    riskProfile: 'Medium',
  },
   {
    id: 'carry_trade_gov',
    title: 'Government Bond Carry Trade',
    description: 'Borrows in low-yield currencies/bonds to invest in higher-yielding government bonds, capturing the yield differential while managing currency and rate risk.',
    minInvestment: 150, // Higher risk
    icon: DollarSign,
    riskProfile: 'High',
  },
];

// Placeholder component for strategy details
const StrategyDetail = ({ title, description, minInvestment, icon: Icon, riskProfile }: Strategy) => (
  <div className="p-4 border rounded-md bg-muted/50">
    <div className="flex justify-between items-center mb-1">
        <h4 className="font-semibold text-md flex items-center">
           {Icon && <Icon className="w-4 h-4 mr-2 text-primary" />} {title}
        </h4>
        <span className={`text-xs px-1.5 py-0.5 rounded capitalize border ${
            riskProfile === 'High' ? 'border-red-500/50 bg-red-500/10 text-red-600' :
            riskProfile === 'Medium' ? 'border-orange-500/50 bg-orange-500/10 text-orange-600' :
            'border-green-500/50 bg-green-500/10 text-green-600'
        }`}>{riskProfile} Risk</span>
    </div>
    <p className="text-sm text-muted-foreground mb-2">{description}</p>
    <p className="text-xs font-medium">
      Minimum Allocation Unit: <span className="text-primary">${minInvestment} M</span> {/* Assuming millions */}
    </p>
  </div>
);

export default function BillXAgent() {
  const { toast } = useToast();
  const [isBillXEnabled, setIsBillXEnabled] = useState(false);
  const [automationLevel, setAutomationLevel] = useState<'strategy' | 'full'>('strategy');
  const [selectedStrategyAmount, setSelectedStrategyAmount] = useState(50); // Default min unit
  const [fullAutomationAmount, setFullAutomationAmount] = useState(300); // Min for full automation (e.g., $300M)
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // --- State Fetching (Placeholder - Needs Backend) ---
  // In a real app, fetch the agent's current state from the backend on mount
  useEffect(() => {
    const fetchAgentState = async () => {
        console.log("Fetching agent state from backend (Placeholder)...");
        try {
            // const response = await fetch('/api/agent/state'); // Your backend endpoint
            // if (!response.ok) throw new Error('Failed to fetch state');
            // const state = await response.json();
            // setIsBillXEnabled(state.isEnabled);
            // setAutomationLevel(state.automationLevel);
            // setSelectedStrategyAmount(state.strategyAmount || 50);
            // setFullAutomationAmount(state.fullAmount || 300);
            // setSelectedStrategies(state.selectedStrategies || []);
            console.warn("Agent state fetching requires backend implementation.");
        } catch (error) {
            console.error("Error fetching agent state:", error);
            toast({ title: "Error", description: "Could not load current agent state.", variant: "destructive" });
        }
    };
    // fetchAgentState(); // Uncomment when backend is ready
  }, [toast]);


  // --- Backend Update Function (Placeholder) ---
  const updateAgentBackendState = useCallback(async (newState: any) => {
      console.log("Updating agent state on backend (Placeholder)...", newState);
      try {
          // const response = await fetch('/api/agent/update', { // Your backend endpoint
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json', /* ...auth headers... */ },
          //     body: JSON.stringify(newState),
          // });
          // if (!response.ok) throw new Error('Failed to update state');
          // const result = await response.json();
          // console.log("Backend update successful:", result);
          console.warn("Agent state update requires backend implementation.");
          return { success: true }; // Simulate success
      } catch (error) {
          console.error("Error updating agent state:", error);
          toast({ title: "Update Failed", description: "Could not save agent settings to backend.", variant: "destructive" });
          return { success: false }; // Indicate failure
      }
  }, [toast]);


  const handleToggleBillX = useCallback(async (enabled: boolean) => {
    let canProceed = true;
    let validationError = '';

    if (enabled) {
      if (automationLevel === 'full' && fullAutomationAmount < 300) {
        validationError = "Full account automation requires a minimum allocation of $300M.";
        canProceed = false;
      } else if (automationLevel === 'strategy') {
          if (selectedStrategies.length === 0) {
              validationError = "Please select at least one strategy before enabling strategy-based automation.";
              canProceed = false;
          } else {
              // Check if amount meets minimum for *all* selected strategies
              const minRequired = Math.max(...selectedStrategies.map(id => availableStrategies.find(s => s.id === id)?.minInvestment || 0));
              if (selectedStrategyAmount < minRequired) {
                   validationError = `The selected amount ($${selectedStrategyAmount}M) is below the minimum required ($${minRequired}M) for one or more selected strategies.`;
                   canProceed = false;
              }
          }
      }
    }

    if (!canProceed) {
      toast({ title: "Activation Prevented", description: validationError, variant: "destructive" });
      setIsBillXEnabled(false); // Ensure it remains disabled
      return;
    }

    // Attempt to update backend first
    const updateSuccess = await updateAgentBackendState({
        isEnabled: enabled,
        automationLevel: automationLevel,
        strategyAmount: selectedStrategyAmount,
        fullAmount: fullAutomationAmount,
        selectedStrategies: automationLevel === 'strategy' ? selectedStrategies : [], // Send relevant data
    });

     if (updateSuccess.success) {
        setIsBillXEnabled(enabled);
        toast({
          title: `Bill X ${enabled ? 'Enabled' : 'Disabled'}`,
          description: enabled
            ? `AI agent is now managing investments based on the selected mode.`
            : `AI agent is no longer managing investments.`,
        });
     } else {
         // Revert UI state if backend update failed
         console.log("Reverting Bill X toggle due to backend failure.");
     }
  }, [automationLevel, fullAutomationAmount, selectedStrategyAmount, selectedStrategies, toast, updateAgentBackendState]);

  const handleAutomationLevelChange = useCallback(async (level: 'strategy' | 'full') => {
      let canProceed = true;
      let validationError = '';

       // Validation if currently enabled
      if (isBillXEnabled) {
          if (level === 'full' && fullAutomationAmount < 300) {
              validationError = "Switching to full automation requires a minimum of $300M. Adjust amount or disable first.";
              canProceed = false;
          } else if (level === 'strategy') {
              if (selectedStrategies.length === 0) {
                  validationError = "Switching to strategy mode requires selecting strategies first.";
                   canProceed = false;
              } else {
                  const minRequired = Math.max(...selectedStrategies.map(id => availableStrategies.find(s => s.id === id)?.minInvestment || 0));
                   if (selectedStrategyAmount < minRequired) {
                       validationError = `Switching requires strategy amount >= $${minRequired}M. Adjust amount or disable first.`;
                       canProceed = false;
                   }
              }
          }
      }

       if (!canProceed) {
            toast({ title: "Switch Prevented", description: validationError, variant: "destructive" });
            return; // Don't change level
       }

      // Update backend if already enabled
      if (isBillXEnabled) {
            const updateSuccess = await updateAgentBackendState({
                 isEnabled: true, // Remains enabled
                 automationLevel: level,
                 strategyAmount: selectedStrategyAmount,
                 fullAmount: fullAutomationAmount,
                 selectedStrategies: level === 'strategy' ? selectedStrategies : [],
             });
            if (!updateSuccess.success) {
                 console.log("Reverting automation level change due to backend failure.");
                 return; // Revert UI change attempt
             }
            toast({
                title: "Automation Mode Updated",
                description: `Bill X is now set to ${level === 'full' ? 'Full Account Automation' : 'Strategy-Based Automation'}.`,
            });
       }

      setAutomationLevel(level); // Update UI state only after validation/backend success (if enabled)

  }, [isBillXEnabled, fullAutomationAmount, selectedStrategyAmount, selectedStrategies, toast, updateAgentBackendState]);


   const handleStrategySelectionChange = useCallback((strategyId: string, checked: boolean) => {
        setSelectedStrategies(prev =>
            checked ? [...prev, strategyId] : prev.filter(id => id !== strategyId)
        );
        // Don't update backend immediately, wait for explicit "Update" button click
   }, []);

   const handleUpdateStrategies = useCallback(async () => {
       if (!isBillXEnabled) {
            toast({ title: "Bill X Disabled", description: "Enable Bill X before applying strategies.", variant: "destructive" });
            return;
       }
        if (automationLevel !== 'strategy') {
            toast({ title: "Incorrect Mode", description: "Strategy selection only applies in 'Strategy-Based Automation' mode.", variant: "destructive"});
            return;
        }
        if (selectedStrategies.length === 0) {
             toast({ title: "No Strategy Selected", description: "Please select at least one strategy to apply.", variant: "destructive" });
            return;
        }
       // Validate minimum amount for selected strategies *before* sending to backend
       const minRequired = Math.max(...selectedStrategies.map(id => availableStrategies.find(s => s.id === id)?.minInvestment || 0));
        if (selectedStrategyAmount < minRequired) {
             toast({ title: "Amount Too Low", description: `The current amount ($${selectedStrategyAmount}M) is below the minimum ($${minRequired}M) required for the selected strategies.`, variant: "destructive"});
            return;
        }

       // Attempt backend update
       const updateSuccess = await updateAgentBackendState({
            isEnabled: true,
            automationLevel: 'strategy',
            strategyAmount: selectedStrategyAmount,
            fullAmount: fullAutomationAmount, // Keep sending full amount context? Or nullify? Check backend needs
            selectedStrategies: selectedStrategies,
        });

        if (updateSuccess.success) {
            toast({
                 title: "Strategies Updated",
                 description: `Bill X will now use the selected strategies: ${selectedStrategies.join(', ')}.`,
            });
        } else {
             console.log("Backend update for strategies failed.");
             // UI state for selectedStrategies is already updated, maybe revert if needed?
        }
   }, [isBillXEnabled, selectedStrategies, toast, automationLevel, selectedStrategyAmount, updateAgentBackendState, fullAutomationAmount]);


   const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAi(true);
    setAiResponse(null);
    setAiError(null);

    try {
      const input: FinancialKnowledgeInput = { query: aiQuery };
      const output: FinancialKnowledgeOutput = await getFinancialKnowledge(input);
      // Validate output structure (basic check)
      if (!output || typeof output.explanation !== 'string' || output.explanation.trim() === '') {
          throw new Error("AI returned an invalid or empty explanation.");
      }
      setAiResponse(output.explanation);

    } catch (err) {
      console.error("AI Knowledge query failed:", err);
      let message = `Failed to get information. ${err instanceof Error ? err.message : 'Please try again.'}`;
       // Add check for specific flow error messages if needed
      if (message.includes("AI response validation failed")) {
           message = "The AI failed to generate a valid explanation in the expected format. Please try rephrasing your query.";
       }
      setAiError(message);
    } finally {
      setLoadingAi(false);
    }
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
       <header className="flex items-center justify-between pb-4 border-b">
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <Bot className="mr-3 h-6 w-6 text-primary" /> Bill X - Governmental AI Trading Agent
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
                <CardDescription>Configure how Bill X manages governmental portfolios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!isBillXEnabled && (
                     <Alert variant="default" className="border-primary/50 bg-primary/5">
                        <Info className="h-4 w-4 !text-primary" />
                        <AlertTitle>Bill X is Currently Disabled</AlertTitle>
                        <AlertDescription>
                            Enable the switch above to allow Bill X to start managing investments based on your chosen settings. Requires backend setup.
                        </AlertDescription>
                    </Alert>
                )}

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
                                    <p className="text-xs text-muted-foreground mt-1">Bill X executes based on selected governmental strategies (e.g., Yield Curve, Spreads).</p>
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
                                    <p className="text-xs text-muted-foreground mt-1">Bill X dynamically diversifies across multiple strategies for portfolio optimization.</p>
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Allocation Settings */}
                {automationLevel === 'strategy' && (
                    <div className="space-y-3 p-4 border rounded-md">
                        <Label htmlFor="strategy-amount" className="font-medium flex items-center">
                            Allocation per Strategy Unit (Millions USD)
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <Info className="h-3 w-3 text-muted-foreground ml-1.5 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Set the base allocation unit Bill X uses for each selected strategy execution.</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        </Label>
                         <div className="flex items-center space-x-4">
                            <Slider
                                id="strategy-amount"
                                min={20} // Reflects lowest minInvestment from strategies
                                max={1000} // Example max unit ($1B)
                                step={10}
                                value={[selectedStrategyAmount]}
                                onValueChange={(value) => setSelectedStrategyAmount(value[0])}
                                className="flex-1"
                                disabled={isBillXEnabled}
                                aria-label="Allocation amount per strategy unit in millions"
                            />
                            <span className="font-semibold text-primary w-24 text-right">${selectedStrategyAmount} M</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum unit varies by strategy (check below). Min overall: $20M.</p>
                         {isBillXEnabled && <p className="text-xs text-destructive">Disable Bill X to change the allocation amount.</p>}
                    </div>
                )}

                 {automationLevel === 'full' && (
                    <div className="space-y-3 p-4 border rounded-md">
                        <Label htmlFor="full-amount" className="font-medium flex items-center">
                            Total Automation Allocation (Millions USD)
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <Info className="h-3 w-3 text-muted-foreground ml-1.5 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Set the total capital Bill X should manage across all strategies.</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        </Label>
                         <div className="flex items-center space-x-4">
                            <Slider
                                id="full-amount"
                                min={300}
                                max={10000} // Example max ($10B)
                                step={100}
                                value={[fullAutomationAmount]}
                                onValueChange={(value) => setFullAutomationAmount(value[0])}
                                className="flex-1"
                                disabled={isBillXEnabled}
                                aria-label="Total amount for full automation in millions"
                            />
                             <span className="font-semibold text-primary w-28 text-right">${fullAutomationAmount} M</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum $300M required for full account automation.</p>
                         {isBillXEnabled && <p className="text-xs text-destructive">Disable Bill X to change the allocation amount.</p>}
                    </div>
                )}

            </CardContent>
        </Card>

        {/* AI Strategies Section */}
        <Card>
            <CardHeader>
                <CardTitle>Bill X Governmental Strategies</CardTitle>
                <CardDescription>Explore the AI-driven strategies Bill X can employ for sovereign instruments.</CardDescription>
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

                 {/* Strategy Selection UI */}
                 {automationLevel === 'strategy' && (
                    <div className="mt-6 p-4 border rounded-md bg-background">
                        <h3 className="text-lg font-semibold mb-3">Select Strategies for Automation</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Choose one or more strategies for Bill X to manage with the allocated unit size (${selectedStrategyAmount}M per strategy execution).
                        </p>
                        <div className="space-y-3">
                             {availableStrategies.map((strategy) => (
                                <div key={strategy.id} className="flex items-center space-x-3">
                                     <Checkbox
                                        id={`strategy-${strategy.id}`}
                                        checked={selectedStrategies.includes(strategy.id)}
                                        onCheckedChange={(checked) => handleStrategySelectionChange(strategy.id, !!checked)}
                                        // disabled={isBillXEnabled} // Allow changes, confirm with Update button
                                        aria-labelledby={`label-strategy-${strategy.id}`}
                                    />
                                    <Label
                                        htmlFor={`strategy-${strategy.id}`}
                                        id={`label-strategy-${strategy.id}`}
                                        className="font-normal cursor-pointer"
                                    >
                                        {strategy.title} <span className="text-xs text-muted-foreground">(Min Unit: ${strategy.minInvestment}M)</span>
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <Button
                            className="mt-4"
                            onClick={handleUpdateStrategies}
                             // Enable only if Bill X is on, in strategy mode, and at least one strategy is selected
                            disabled={!isBillXEnabled || automationLevel !== 'strategy' || selectedStrategies.length === 0}
                        >
                           {isBillXEnabled ? <><Check className="mr-2 h-4 w-4" /> Apply Selected Strategies</> : 'Enable Bill X to Apply'}
                        </Button>
                         {!isBillXEnabled && <p className="text-xs text-muted-foreground mt-2">Enable Bill X and select strategies to apply.</p>}
                         {isBillXEnabled && automationLevel === 'strategy' && <p className="text-xs text-muted-foreground mt-2">Click "Apply Selected Strategies" to save changes.</p>}
                         {isBillXEnabled && automationLevel !== 'strategy' && <p className="text-xs text-muted-foreground mt-2">Switch to 'Strategy-Based Automation' to apply specific strategies.</p>}
                    </div>
                )}
            </CardContent>
        </Card>

         {/* AI Knowledge Hub Section */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BrainCircuit className="mr-2 h-5 w-5 text-primary" /> Ask Bill X - Financial Intelligence
                </CardTitle>
                <CardDescription>Leverage Bill X's knowledge on finance, markets, and economics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex space-x-2">
                    <Input
                        type="text"
                        placeholder="E.g., Explain duration risk for sovereign bonds..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                        disabled={loadingAi}
                        aria-label="Ask Bill X a financial question"
                    />
                    <Button onClick={handleAiQuery} disabled={loadingAi || !aiQuery.trim()} aria-label="Submit question to Bill X">
                        {loadingAi ? <Skeleton className="h-5 w-5 rounded-full animate-spin" /> : <Search className="h-5 w-5" />}
                         <span className="ml-2 sm:inline hidden">Ask</span>
                    </Button>
                 </div>

                {aiError && (
                    <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Query Error</AlertTitle>
                    <AlertDescription>{aiError}</AlertDescription>
                    </Alert>
                )}

                 {loadingAi && (
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                 )}

                 {aiResponse && !loadingAi && (
                    <div className="pt-4 border-t mt-4 max-h-72 overflow-y-auto pr-2"> {/* Increased max height */}
                         <h4 className="font-semibold mb-2">Bill X Response:</h4>
                         <div className="text-sm whitespace-pre-wrap">{aiResponse}</div>
                    </div>
                )}
            </CardContent>
        </Card>

    </div>
  );
}
