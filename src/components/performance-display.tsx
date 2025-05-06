
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
import { Bot, Activity, Clock, Zap, TrendingUp, DollarSign, TrendingDown, AlertTriangle, LineChart, Info, CheckSquare, XSquare } from 'lucide-react'; // Added LineChart, Info, CheckSquare, XSquare
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getHistoricalData } from '@/services/broker-api'; // Real API placeholder

// --- Interface Definitions ---

interface AgentStatus {
  isEnabled: boolean;
  mode: 'strategy' | 'full' | 'unknown'; // Added 'unknown' state
  allocatedAmount?: number; // Make optional as it might not always apply or be available
  strategy?: string; // Optional active strategy name
}

interface AgentAction {
  id: string; // Use string ID from backend
  timestamp: Date;
  type: 'BUY' | 'SELL' | 'REBALANCE' | 'INFO' | 'ERROR' | 'ENABLE' | 'DISABLE' | 'MODE_CHANGE'; // Added lifecycle events
  details: string;
  amount?: number;
  ticker?: string;
  strategyContext?: string; // Which strategy triggered the action
}

// --- API Call Placeholders (Need Backend Implementation) ---

/**
 * Fetches the current status of the Bill X agent from the backend.
 * @returns Promise resolving to AgentStatus
 * @throws {Error} If backend call fails.
 */
const fetchAgentStatus = async (): Promise<AgentStatus> => {
    console.log("API Call: fetchAgentStatus (Needs Backend)");
    // ** REAL BACKEND INTEGRATION POINT **
    // Replace with actual fetch call to your backend endpoint (e.g., /api/agent/status)
    /*
    try {
        const response = await fetch('/api/agent/status', { headers: { ... auth headers ... } });
        if (!response.ok) throw new Error(`Backend Error: ${response.status}`);
        const status: AgentStatus = await response.json();
        return status;
    } catch (error: any) {
        console.error("Failed to fetch agent status from backend:", error);
        throw new Error(`Failed to load agent status: ${error.message}`);
    }
    */

    // Placeholder error for unimplemented backend:
    throw new Error("fetchAgentStatus requires a backend implementation.");
    // Placeholder return (unreachable if error is thrown):
    // return { isEnabled: false, mode: 'unknown' };
};

/**
 * Fetches the recent action log of the Bill X agent from the backend.
 * @param limit Max number of actions to fetch.
 * @returns Promise resolving to an array of AgentAction.
 * @throws {Error} If backend call fails.
 */
const fetchAgentActions = async (limit: number = 50): Promise<AgentAction[]> => {
    console.log(`API Call: fetchAgentActions(limit=${limit}) (Needs Backend)`);
    // ** REAL BACKEND INTEGRATION POINT **
    // Replace with actual fetch call to your backend endpoint (e.g., /api/agent/actions?limit=...)
     /*
    try {
        const response = await fetch(`/api/agent/actions?limit=${limit}`, { headers: { ... auth headers ... } });
        if (!response.ok) throw new Error(`Backend Error: ${response.status}`);
        const actions: AgentAction[] = await response.json();
        // Ensure timestamps are Date objects
        return actions.map(action => ({ ...action, timestamp: new Date(action.timestamp) }));
    } catch (error: any) {
        console.error("Failed to fetch agent actions from backend:", error);
        throw new Error(`Failed to load agent actions: ${error.message}`);
    }
    */

    // Placeholder error for unimplemented backend:
     throw new Error("fetchAgentActions requires a backend implementation.");
     // Placeholder return (unreachable if error is thrown):
    // return [];
};


// Chart configuration (reused)
const chartConfig = {
  value: { label: "Value", color: "hsl(var(--primary))" },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

export default function PerformanceDisplay() {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [actionsError, setActionsError] = useState<string | null>(null); // Specific error for actions
  // No longer need mock action counter

  // State for market chart
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [chartRange, setChartRange] = useState<string>('1m');
  const [chartTicker] = useState<string>('SPY'); // Fixed market context chart
  const [loadingChart, setLoadingChart] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);


   const formatCurrency = useCallback((value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$--.--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }, []);

  // Fetch agent status on mount
  useEffect(() => {
    const getStatus = async () => {
        setLoadingStatus(true);
        setStatusError(null);
        try {
            const status = await fetchAgentStatus();
            setAgentStatus(status);
        } catch (err: any) {
            console.error("Failed to fetch agent status:", err);
            setStatusError(err.message || 'Failed to load agent status. Check backend.');
            setAgentStatus(null); // Ensure status is null on error
        } finally {
            setLoadingStatus(false);
        }
    };
    getStatus();
  }, []);

  // Load initial actions and set up polling (optional)
  useEffect(() => {
    const getActions = async () => {
        setLoadingActions(true);
        setActionsError(null);
        try {
            const fetchedActions = await fetchAgentActions(50); // Fetch initial 50 actions
            // Sort by timestamp descending if backend doesn't guarantee order
            setActions(fetchedActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        } catch (err: any) {
             console.error("Failed to fetch agent actions:", err);
             setActionsError(err.message || 'Failed to load agent actions. Check backend.');
             setActions([]); // Clear actions on error
        } finally {
             setLoadingActions(false);
        }
    };
    getActions();

    // Optional: Set up polling to refresh actions periodically
    // const intervalId = setInterval(getActions, 30000); // Refresh every 30 seconds
    // return () => clearInterval(intervalId); // Clean up interval on unmount

  }, []); // Fetch on mount


   // Fetch historical chart data for market context (SPY)
   useEffect(() => {
    const fetchChartData = async () => {
      setLoadingChart(true);
      setChartError(null);
      setChartData([]);
      try {
        // getHistoricalData uses real API placeholder
        const history = await getHistoricalData(chartTicker, chartRange);
         if (!Array.isArray(history) || history.length === 0) {
             throw new Error("No historical data returned.");
         }
        setChartData(history);
      } catch (err: any) {
        console.error(`Failed to fetch historical data for ${chartTicker}:`, err);
        setChartError(`Could not load chart data for ${chartTicker}: ${err.message || 'Check API setup.'}`);
        setChartData([]);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchChartData();
   }, [chartTicker, chartRange]); // Dependencies: ticker (fixed) and range


  const getStatusBadgeVariant = (status: boolean | undefined): 'default' | 'destructive' | 'secondary' => {
     if (status === undefined) return 'secondary'; // Use secondary for unknown/error state
    return status ? 'default' : 'destructive';
  };

   const getActionIcon = (type: AgentAction['type']) => {
        switch (type) {
            case 'BUY': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'SELL': return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'REBALANCE': return <Zap className="h-4 w-4 text-blue-500" />;
            case 'INFO': return <Activity className="h-4 w-4 text-gray-500" />;
            case 'ERROR': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'ENABLE': return <CheckSquare className="h-4 w-4 text-green-500" />;
            case 'DISABLE': return <XSquare className="h-4 w-4 text-red-500" />;
            case 'MODE_CHANGE': return <Bot className="h-4 w-4 text-purple-500" />; // Example icon for mode change
            default: return <Bot className="h-4 w-4" />; // Default Bot icon
        }
   }


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
          <Activity className="mr-3 h-6 w-6 text-primary" /> Bill X Performance Monitor
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
                <>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-28" />
                </>
           ) : statusError ? (
                 <Alert variant="destructive" className="sm:col-span-2 md:col-span-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Status Error</AlertTitle>
                    <AlertDescription>{statusError}</AlertDescription>
                 </Alert>
           ) : agentStatus ? ( // Only render if status is successfully loaded
             <>
               <div className="flex items-center space-x-2">
                    <span className="font-medium text-muted-foreground">Status:</span>
                    <Badge variant={getStatusBadgeVariant(agentStatus.isEnabled)}>
                         {agentStatus.isEnabled === undefined ? 'Unknown' : agentStatus.isEnabled ? 'Active' : 'Inactive'}
                    </Badge>
               </div>
                <div className="flex items-center space-x-2">
                    <span className="font-medium text-muted-foreground">Mode:</span>
                    <span className="font-semibold flex items-center capitalize">
                        {agentStatus.mode === 'full' ? <TrendingUp className="w-4 h-4 mr-1.5"/> : agentStatus.mode === 'strategy' ? <Zap className="w-4 h-4 mr-1.5"/> : <Info className="w-4 h-4 mr-1.5" />}
                        {agentStatus.mode === 'full' ? 'Full Automation' : agentStatus.mode === 'strategy' ? 'Strategy-Based' : 'Unknown'}
                    </span>
               </div>
               <div className="flex items-center space-x-2">
                    <span className="font-medium text-muted-foreground">Allocation:</span>
                    <span className="font-semibold flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600"/>
                         {agentStatus.allocatedAmount !== undefined ? `$${agentStatus.allocatedAmount.toLocaleString()}` : 'N/A'}
                         {agentStatus.mode === 'strategy' && <span className="text-xs text-muted-foreground ml-1">(per strategy)</span>}
                    </span>
               </div>
                {agentStatus.mode === 'strategy' && agentStatus.strategy && (
                    <div className="flex items-center space-x-2 sm:col-span-2 md:col-span-3">
                        <span className="font-medium text-muted-foreground">Active Strategy:</span>
                        <span className="font-semibold">{agentStatus.strategy}</span>
                    </div>
               )}
             </>
           ) : ( // This case should ideally not be reached if error handling is correct
                <p className="text-muted-foreground sm:col-span-2 md:col-span-3">Agent status unavailable.</p>
           )}
        </CardContent>
      </Card>

       {/* Market Performance Chart Card (SPY Context) */}
       <Card>
         <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
               <div>
                  <CardTitle className="flex items-center">
                     <LineChart className="mr-2 h-5 w-5 text-primary" /> Market Performance (S&P 500 - SPY)
                  </CardTitle>
                  <CardDescription>Overall market trend for context. Requires API setup.</CardDescription>
               </div>
                <Select value={chartRange} onValueChange={setChartRange} disabled={loadingChart}>
                  <SelectTrigger className="w-full sm:w-[100px]" aria-label="Select chart time range">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1M</SelectItem>
                    <SelectItem value="6m">6M</SelectItem>
                    <SelectItem value="1y">1Y</SelectItem>
                  </SelectContent>
                </Select>
            </div>
         </CardHeader>
         <CardContent>
            <div className="h-[250px] w-full relative border rounded-md p-2">
                 {loadingChart ? (
                     <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                         <Skeleton className="h-full w-full" />
                          <span className="absolute text-sm text-muted-foreground">Loading chart data...</span>
                     </div>
                 ) : chartError ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 rounded-md text-center p-4">
                         <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
                        <p className="text-sm font-medium text-destructive">Chart Error</p>
                        <p className="text-xs text-destructive">{chartError}</p>
                    </div>
                 ) : chartData.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                        <p className="text-sm text-muted-foreground p-4 text-center">No historical data available for SPY.</p>
                    </div>
                 ) : (
                     <ChartContainer config={chartConfig} className="h-full w-full">
                         <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis
                                dataKey="date" tickLine={false} axisLine={false} tickMargin={8}
                                tickFormatter={(value, index) => {
                                    try {
                                        const date = new Date(value + 'T00:00:00Z'); if (isNaN(date.getTime())) return '';
                                        const numPoints = chartData.length;
                                        if (chartRange === '1m') { const wi = Math.max(1, Math.floor(numPoints / 4)); return index === 0 || index === numPoints - 1 || index % wi === 0 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : ''; }
                                        else if (chartRange === '6m') { const mi = Math.max(1, Math.floor(numPoints / 6)); return index === 0 || index === numPoints - 1 || index % mi === 0 ? date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) : ''; }
                                        else if (chartRange === '1y') { const qi = Math.max(1, Math.floor(numPoints / 4)); return index === 0 || index === numPoints - 1 || index % qi === 0 ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }) : ''; }
                                        else { return ''; }
                                    } catch (e) { return ''; }
                                 }}
                                 interval="preserveStartEnd" minTickGap={chartRange === '1m' ? 5 : 15}
                             />
                             <YAxis
                                tickLine={false} axisLine={false} tickMargin={5}
                                domain={['dataMin - (dataMax-dataMin)*0.05', 'dataMax + (dataMax-dataMin)*0.05']}
                                tickFormatter={(value) => `$${value.toFixed(0)}`} width={45}
                              />
                             <ChartTooltip cursor={true} content={ <ChartTooltipContent labelFormatter={(label) => { try { return new Date(label + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); } catch { return label; } }} formatter={(value) => formatCurrency(value as number)} indicator="dot" labelClassName="text-sm font-semibold" nameKey="name" /> } />
                             <defs> <linearGradient id="fillValuePerf" x1="0" y1="0" x2="0" y2="1"> <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8}/> <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1}/> </linearGradient> </defs>
                             <Area dataKey="value" type="monotone" fill="url(#fillValuePerf)" stroke="var(--color-value)" strokeWidth={2} name={chartTicker} dot={false} activeDot={{ r: 4, strokeWidth: 1, fill: 'hsl(var(--background))', stroke: 'var(--color-value)' }} />
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
           <ScrollArea className="h-[400px] w-full pr-4 border rounded-md">
            {loadingActions ? (
                 <div className="space-y-4 p-4">
                     {[...Array(5)].map((_, i) => ( <div key={i} className="flex items-start space-x-3"> <Skeleton className="h-5 w-5 rounded-full mt-0.5" /> <div className="flex-1 space-y-1.5"> <Skeleton className="h-4 w-3/4" /> <Skeleton className="h-3 w-1/2" /> </div> </div> ))}
                 </div>
            ) : actionsError ? (
                 <Alert variant="destructive" className="m-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Actions Error</AlertTitle>
                    <AlertDescription>{actionsError}</AlertDescription>
                 </Alert>
            ) : actions.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                     <p className="text-center text-muted-foreground py-10">No agent actions recorded yet.</p>
                </div>
            ) : (
                 <ul className="space-y-3 p-4">
                    {actions.map((action) => (
                        <li key={action.id} className={`flex items-start space-x-3 border-b pb-3 last:border-b-0 ${action.type === 'ERROR' ? 'bg-yellow-500/10 rounded p-2 -m-2' : ''}`}>
                            <div className="flex-shrink-0 pt-1">
                                {getActionIcon(action.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${action.type === 'ERROR' ? 'text-yellow-700 dark:text-yellow-300' : ''} break-words`}>{action.details}</p>
                                <p className="text-xs text-muted-foreground flex items-center flex-wrap gap-x-2 mt-0.5">
                                    <span className="flex items-center">
                                         <Clock className="h-3 w-3 mr-1" /> {action.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - {action.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                     {action.amount && (
                                        <span className="flex items-center">
                                            <DollarSign className={`h-3 w-3 mr-0.5 ${action.type === 'BUY' ? 'text-green-600' : action.type === 'SELL' ? 'text-red-600' : ''}`}/>
                                            {action.amount.toLocaleString()}
                                        </span>
                                    )}
                                     {action.ticker && action.type !== 'BUY' && action.type !== 'SELL' && (
                                        <span className="text-xs font-mono bg-muted px-1 rounded">{action.ticker}</span>
                                     )}
                                     {action.strategyContext && (
                                         <span className="text-xs italic text-muted-foreground">({action.strategyContext})</span>
                                     )}
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
