

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Activity, Clock, Zap, TrendingUp, DollarSign, TrendingDown, AlertTriangle, LineChart, Info, CheckSquare, XSquare, Landmark, Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getHistoricalData, getGovBondYields, GovBondYield, ApiError, DataProviderError } from '@/services/broker-api'; // Use relevant APIs and Errors
import { useToast } from '@/hooks/use-toast'; // Import useToast

// --- Interface Definitions ---

interface AgentStatus {
  isEnabled: boolean;
  mode: 'strategy' | 'full' | 'unknown';
  allocatedAmount?: number; // Total for 'full', Unit for 'strategy' (Millions)
  activeStrategies?: string[]; // List of active strategy IDs
}

interface AgentAction {
  id: string;
  timestamp: Date;
  type: 'BUY' | 'SELL' | 'REBALANCE' | 'INFO' | 'ERROR' | 'ENABLE' | 'DISABLE' | 'MODE_CHANGE' | 'STRATEGY_UPDATE';
  details: string;
  amount?: number;
  ticker?: string;
  priceOrYield?: number;
  strategyContext?: string;
}

// --- API Call Placeholders (Need Backend Implementation) ---
// These functions should ideally return specific error types if they fail

/**
 * Fetches the current status of the Bill X agent from the backend.
 * @returns Promise resolving to AgentStatus
 * @throws {ApiError} If backend communication fails.
 */
const fetchAgentStatus = async (): Promise<AgentStatus> => {
    const operation = 'fetchAgentStatus';
    console.log(`API Call: ${operation} (Needs Backend)`);
    // ** REAL BACKEND INTEGRATION POINT **
    /*
    try {
        // Replace with actual fetch call to your backend endpoint (e.g., /api/agent/status)
        const response = await fetch('/api/agent/status', { headers: { ... auth headers ... } });
        if (!response.ok) {
             const errorText = await response.text().catch(() => response.statusText);
             throw new ApiError(`Backend Error fetching agent status: ${response.status} ${errorText}`);
        }
        const status: AgentStatus = await response.json();
        // Add validation for the received status object here if needed
        return status;
    } catch (error: any) {
        console.error(`Failed to fetch agent status from backend:`, error);
        if (error instanceof ApiError) throw error; // Re-throw known API errors
        throw new ApiError(`Failed to load agent status: ${error.message}`, error); // Wrap unknown errors
    }
    */

    // Placeholder/Mock Implementation
    console.warn(`${operation} using MOCK data. Requires backend.`);
    await new Promise(res => setTimeout(res, 300));
    // Simulate potential error during mock fetch
    if (Math.random() < 0.05) { // 5% chance of simulated backend error
        throw new ApiError("Simulated backend error fetching agent status.");
    }
    const isEnabled = Math.random() > 0.3;
    const mode = isEnabled ? (Math.random() > 0.5 ? 'full' : 'strategy') : 'unknown';
    return {
        isEnabled: isEnabled,
        mode: mode,
        allocatedAmount: mode === 'full' ? 500 : 50,
        activeStrategies: mode === 'strategy' ? ['yield_curve_positioning', 'inflation_protection'] : [],
    };
};

/**
 * Fetches the recent action log of the Bill X agent from the backend.
 * @param limit Max number of actions to fetch.
 * @returns Promise resolving to an array of AgentAction.
 * @throws {ApiError} If backend communication fails.
 */
const fetchAgentActions = async (limit: number = 50): Promise<AgentAction[]> => {
    const operation = `fetchAgentActions(limit=${limit})`;
    console.log(`API Call: ${operation} (Needs Backend)`);
    // ** REAL BACKEND INTEGRATION POINT **
     /*
    try {
        // Replace with actual fetch call to your backend endpoint (e.g., /api/agent/actions?limit=${limit})
        const response = await fetch(`/api/agent/actions?limit=${limit}`, { headers: { ... auth headers ... } });
        if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            throw new ApiError(`Backend Error fetching agent actions: ${response.status} ${errorText}`);
        }
        const actions: AgentAction[] = await response.json();
        // Validate and parse timestamps
        return actions.map(action => {
            if (!action.id || !action.timestamp || !action.type || !action.details) {
                console.warn("Received incomplete action data:", action);
                // Handle incomplete data, maybe filter it out or mark as invalid
            }
            return { ...action, timestamp: new Date(action.timestamp) };
        });
    } catch (error: any) {
        console.error(`Failed to fetch agent actions from backend:`, error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(`Failed to load agent actions: ${error.message}`, error);
    }
    */

    // Placeholder/Mock Implementation
    console.warn(`${operation} using MOCK data. Requires backend.`);
    await new Promise(res => setTimeout(res, 600));
    // Simulate potential error
    if (Math.random() < 0.05) {
        throw new ApiError("Simulated backend error fetching agent actions.");
    }
    const actions: AgentAction[] = [];
    const now = new Date();
    const types: AgentAction['type'][] = ['BUY', 'SELL', 'REBALANCE', 'INFO', 'ERROR', 'ENABLE', 'DISABLE', 'MODE_CHANGE', 'STRATEGY_UPDATE'];
    const tickers = ['US10Y', 'DE10Y', 'US02Y', 'TIPS5Y', 'GOVT'];
    const strategies = ['yield_curve_positioning', 'sovereign_spread_trading', 'inflation_protection'];

    for (let i = 0; i < limit; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000 * Math.random() * 5);
        let details = `Action ${i + 1}`;
        let ticker: string | undefined = undefined;
        let amount: number | undefined = undefined;
        let priceOrYield: number | undefined = undefined;
        let strategyContext: string | undefined = undefined;

        switch (type) {
            case 'BUY': case 'SELL':
                ticker = tickers[Math.floor(Math.random() * tickers.length)];
                amount = Math.floor(Math.random() * 5 + 1) * 1000000;
                priceOrYield = 98 + Math.random() * 4;
                details = `${type} ${amount.toLocaleString()} ${ticker} at ${priceOrYield.toFixed(3)}`;
                strategyContext = strategies[Math.floor(Math.random() * strategies.length)];
                break;
            case 'REBALANCE': details = `Portfolio rebalance triggered.`; strategyContext = 'duration_management'; break;
            case 'INFO': details = `Monitoring ${tickers[Math.floor(Math.random() * tickers.length)]}.`; break;
            case 'ERROR': details = `Failed execution for ${tickers[Math.floor(Math.random() * tickers.length)]}: Timeout.`; break;
            case 'ENABLE': details = `Agent enabled in ${Math.random() > 0.5 ? 'full' : 'strategy'} mode.`; break;
            case 'DISABLE': details = `Agent disabled.`; break;
            case 'MODE_CHANGE': details = `Mode changed to ${Math.random() > 0.5 ? 'full' : 'strategy'} automation.`; break;
            case 'STRATEGY_UPDATE': details = `Applied strategies: [${strategies[0]}, ${strategies[1]}]`; break;
        }

        actions.push({
            id: `act_${timestamp.getTime()}_${i}`, // Ensure unique ID for mock data
            timestamp: timestamp, type: type, details: details, amount: amount, ticker: ticker, priceOrYield: priceOrYield, strategyContext: strategyContext,
        });
    }
    return actions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};


// Chart configuration
const chartConfig = {
  value: { label: "Yield", color: "hsl(var(--primary))" },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

export default function PerformanceDisplay() {
  const { toast } = useToast(); // Initialize toast
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [actionsError, setActionsError] = useState<string | null>(null);

  // State for yield curve chart
  const [yieldCurveData, setYieldCurveData] = useState<GovBondYield[]>([]);
  const [loadingYieldCurve, setLoadingYieldCurve] = useState(true);
  const [yieldCurveError, setYieldCurveError] = useState<string | null>(null);

   const formatCurrency = useCallback((value: number | undefined, millions = false) => {
    if (value === undefined || isNaN(value)) return '$--.--';
    const amount = millions ? value * 1000000 : value;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: millions ? 'compact' : 'standard', maximumFractionDigits: millions ? 1 : 2 }).format(amount);
  }, []);

  // Fetch agent status on mount with error handling
  useEffect(() => {
    const getStatus = async () => {
        setLoadingStatus(true);
        setStatusError(null);
        try {
            const status = await fetchAgentStatus();
            setAgentStatus(status);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load agent status. Check backend.';
            console.error("Failed to fetch agent status:", err);
            setStatusError(errorMessage);
            setAgentStatus(null);
            toast({ // Notify user of the error
                variant: "destructive",
                title: "Agent Status Error",
                description: errorMessage,
            });
        } finally {
            setLoadingStatus(false);
        }
    };
    getStatus();
  }, [toast]); // Add toast dependency

  // Load initial actions with error handling
  useEffect(() => {
    const getActions = async () => {
        setLoadingActions(true);
        setActionsError(null);
        try {
            const fetchedActions = await fetchAgentActions(50);
            // Add validation for fetched actions if necessary
            setActions(fetchedActions);
        } catch (err: any) {
             const errorMessage = err.message || 'Failed to load agent actions. Check backend.';
             console.error("Failed to fetch agent actions:", err);
             setActionsError(errorMessage);
             setActions([]);
             toast({ // Notify user of the error
                 variant: "destructive",
                 title: "Action Log Error",
                 description: errorMessage,
             });
        } finally {
             setLoadingActions(false);
        }
    };
    getActions();
  }, [toast]); // Add toast dependency

   // Fetch yield curve data with error handling
   useEffect(() => {
    const fetchYieldData = async () => {
      setLoadingYieldCurve(true);
      setYieldCurveError(null);
      setYieldCurveData([]);
      try {
        const yields = await getGovBondYields(); // This function now throws specific errors
        if (!Array.isArray(yields)) { // Basic validation
             throw new Error("Invalid yield data format received.");
        }
        if (yields.length === 0) {
            console.warn("No yield curve data returned from API.");
            setYieldCurveError("No yield curve data currently available."); // Inform user
        }

        const formattedYields = yields.map(y => ({ name: y.maturity, value: y.yield }));
        setYieldCurveData(formattedYields as any);
      } catch (err: any) {
        const errorMessage = err.message || 'Could not load yield curve. Check API setup.';
        console.error(`Failed to fetch yield curve data:`, err);
        setYieldCurveError(errorMessage);
        setYieldCurveData([]);
        toast({ // Notify user of the error
            variant: "destructive",
            title: "Yield Curve Error",
            description: errorMessage,
        });
      } finally {
        setLoadingYieldCurve(false);
      }
    };
    fetchYieldData();
   }, [toast]); // Add toast dependency


  const getStatusBadgeVariant = (status: boolean | undefined): 'default' | 'destructive' | 'secondary' => {
     if (status === undefined) return 'secondary';
    return status ? 'default' : 'destructive';
  };

   const getActionIcon = (type: AgentAction['type']) => {
        switch (type) {
            case 'BUY': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'SELL': return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'REBALANCE': return <Scale className="h-4 w-4 text-blue-500" />;
            case 'INFO': return <Activity className="h-4 w-4 text-gray-500" />;
            case 'ERROR': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'ENABLE': return <CheckSquare className="h-4 w-4 text-green-500" />;
            case 'DISABLE': return <XSquare className="h-4 w-4 text-red-500" />;
            case 'MODE_CHANGE': return <Bot className="h-4 w-4 text-purple-500" />;
            case 'STRATEGY_UPDATE': return <Zap className="h-4 w-4 text-orange-500" />;
            default: return <Landmark className="h-4 w-4" />;
        }
   }

   const formatYield = (value: number | undefined): string => {
        if (value === undefined || isNaN(value)) return '--.--%';
        return `${value.toFixed(2)}%`;
   };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
          <Activity className="mr-3 h-6 w-6 text-primary" /> Bill X Agent Monitor
        </h1>
      </header>

      {/* Agent Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
             <Bot className="mr-2 text-primary" /> Bill X Agent Status
          </CardTitle>
           {loadingStatus ? (
                <Skeleton className="h-4 w-3/4 mt-1" />
           ) : statusError ? (
                <CardDescription className="text-destructive">Could not load agent status.</CardDescription>
           ) : (
                <CardDescription>Current configuration and operational status (Requires Backend).</CardDescription>
           )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           {loadingStatus ? (
                <> <Skeleton className="h-6 w-24" /> <Skeleton className="h-6 w-32" /> <Skeleton className="h-6 w-40" /> </>
           ) : statusError ? (
                 <Alert variant="destructive" className="sm:col-span-2 md:col-span-3"> <AlertTriangle className="h-4 w-4" /> <AlertTitle>Status Error</AlertTitle> <AlertDescription>{statusError}</AlertDescription> </Alert>
           ) : agentStatus ? (
             <>
               <div className="flex items-center space-x-2"> <span className="font-medium text-muted-foreground">Status:</span> <Badge variant={getStatusBadgeVariant(agentStatus.isEnabled)}> {agentStatus.isEnabled === undefined ? 'Unknown' : agentStatus.isEnabled ? 'Active' : 'Inactive'} </Badge> </div>
                <div className="flex items-center space-x-2"> <span className="font-medium text-muted-foreground">Mode:</span> <span className="font-semibold flex items-center capitalize"> {agentStatus.mode === 'full' ? <TrendingUp className="w-4 h-4 mr-1.5"/> : agentStatus.mode === 'strategy' ? <Zap className="w-4 h-4 mr-1.5"/> : <Info className="w-4 h-4 mr-1.5" />} {agentStatus.mode === 'full' ? 'Full Automation' : agentStatus.mode === 'strategy' ? 'Strategy-Based' : 'Unknown'} </span> </div>
               <div className="flex items-center space-x-2"> <span className="font-medium text-muted-foreground">Allocation:</span> <span className="font-semibold flex items-center"> <DollarSign className="w-4 h-4 mr-1 text-green-600"/> {agentStatus.allocatedAmount !== undefined ? formatCurrency(agentStatus.allocatedAmount, true) : 'N/A'} {agentStatus.mode === 'strategy' && <span className="text-xs text-muted-foreground ml-1">(Unit)</span>} </span> </div>
                {agentStatus.mode === 'strategy' && agentStatus.activeStrategies && agentStatus.activeStrategies.length > 0 && (
                    <div className="flex items-center space-x-2 sm:col-span-2 md:col-span-3">
                        <span className="font-medium text-muted-foreground">Active Strategies:</span>
                        <span className="font-semibold text-xs">{agentStatus.activeStrategies.join(', ')}</span>
                    </div>
               )}
             </>
           ) : (
                <p className="text-muted-foreground sm:col-span-2 md:col-span-3">Agent status unavailable.</p>
           )}
        </CardContent>
      </Card>

       {/* Yield Curve Chart Card */}
       <Card>
         <CardHeader>
            <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5 text-primary" /> Treasury Yield Curve
            </CardTitle>
            <CardDescription>Current government bond yields by maturity. Requires API setup.</CardDescription>
         </CardHeader>
         <CardContent>
            {/* Error display specific to Yield Curve */}
            {yieldCurveError && !loadingYieldCurve && (
                 <Alert variant="destructive" className="mb-4">
                     <AlertTriangle className="h-4 w-4" />
                     <AlertTitle>Yield Curve Error</AlertTitle>
                     <AlertDescription>{yieldCurveError}</AlertDescription>
                 </Alert>
             )}
            <div className="h-[250px] w-full relative border rounded-md p-2">
                 {loadingYieldCurve ? (
                     <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md"> <Skeleton className="h-full w-full" /> <span className="absolute text-sm text-muted-foreground">Loading yield data...</span> </div>
                 ) : yieldCurveData.length === 0 ? (
                      // Show message if loading finished but no data (and no critical error shown above)
                      !yieldCurveError && <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md"> <p className="text-sm text-muted-foreground p-4 text-center">No yield curve data available.</p> </div>
                 ) : (
                     // Render chart only if data is available and no error occurred
                     !yieldCurveError &&
                     <ChartContainer config={chartConfig} className="h-full w-full">
                         <AreaChart data={yieldCurveData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-30} textAnchor="end" height={40} />
                             <YAxis tickLine={false} axisLine={false} tickMargin={5} domain={['dataMin - 0.2', 'dataMax + 0.2']} tickFormatter={(value) => `${value.toFixed(1)}%`} width={35} />
                             <ChartTooltip cursor={true} content={ <ChartTooltipContent formatter={(value) => formatYield(value as number)} indicator="dot" labelClassName="text-sm font-semibold" /> } />
                             <defs> <linearGradient id="fillYieldCurve" x1="0" y1="0" x2="0" y2="1"> <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8}/> <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1}/> </linearGradient> </defs>
                             <Area dataKey="value" type="monotone" fill="url(#fillYieldCurve)" stroke="var(--color-value)" strokeWidth={2} name="Yield" dot={true} activeDot={{ r: 4, strokeWidth: 1, fill: 'hsl(var(--background))', stroke: 'var(--color-value)' }} />
                         </AreaChart>
                     </ChartContainer>
                 )}
             </div>
         </CardContent>
       </Card>


      {/* Action Log Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Activity className="mr-2 text-primary" /> Agent Action Log</CardTitle>
          <CardDescription>Feed of actions taken by the Bill X agent (Requires Backend).</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Error display specific to Action Log */}
            {actionsError && !loadingActions && (
                 <Alert variant="destructive" className="mb-4">
                     <AlertTriangle className="h-4 w-4" />
                     <AlertTitle>Action Log Error</AlertTitle>
                     <AlertDescription>{actionsError}</AlertDescription>
                 </Alert>
             )}
           <ScrollArea className="h-[400px] w-full pr-4 border rounded-md">
            {loadingActions ? (
                 <div className="space-y-4 p-4"> {[...Array(5)].map((_, i) => ( <div key={i} className="flex items-start space-x-3"> <Skeleton className="h-5 w-5 rounded-full mt-0.5" /> <div className="flex-1 space-y-1.5"> <Skeleton className="h-4 w-3/4" /> <Skeleton className="h-3 w-1/2" /> </div> </div> ))} </div>
            ) : actions.length === 0 ? (
                 // Show message if loading finished but no data (and no critical error shown above)
                !actionsError && <div className="flex items-center justify-center h-full"> <p className="text-center text-muted-foreground py-10">No agent actions recorded yet.</p> </div>
            ) : (
                 // Render list only if data is available and no error occurred
                 !actionsError &&
                 <ul className="space-y-3 p-4">
                    {actions.map((action) => (
                        <li key={action.id} className={`flex items-start space-x-3 border-b pb-3 last:border-b-0 ${action.type === 'ERROR' ? 'bg-yellow-500/10 rounded p-2 -m-2' : ''}`}>
                            <div className="flex-shrink-0 pt-1"> {getActionIcon(action.type)} </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${action.type === 'ERROR' ? 'text-yellow-700 dark:text-yellow-300' : ''} break-words`}>{action.details}</p>
                                <p className="text-xs text-muted-foreground flex items-center flex-wrap gap-x-2 mt-0.5">
                                    <span className="flex items-center"> <Clock className="h-3 w-3 mr-1" /> {action.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - {action.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })} </span>
                                     {action.amount && ( <span className="flex items-center"> <DollarSign className={`h-3 w-3 mr-0.5 ${action.type === 'BUY' ? 'text-green-600' : action.type === 'SELL' ? 'text-red-600' : ''}`}/> {formatCurrency(action.amount)} </span> )}
                                     {action.ticker && <span className="text-xs font-mono bg-muted px-1 rounded">{action.ticker}</span>}
                                     {action.priceOrYield && <span className="text-xs">@{action.priceOrYield.toFixed(3)}</span>}
                                     {action.strategyContext && ( <span className="text-xs italic text-blue-600 dark:text-blue-400">({action.strategyContext})</span> )}
                                </p>
                            </div>
                        </li>
                    ))}
                 </ul>
            )}
           </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

    