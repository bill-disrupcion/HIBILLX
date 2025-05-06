// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Activity, Clock, Zap, TrendingUp, DollarSign, TrendingDown } from 'lucide-react'; // Added TrendingDown
import { Skeleton } from '@/components/ui/skeleton';

interface AgentAction {
  id: number;
  timestamp: Date;
  type: 'BUY' | 'SELL' | 'REBALANCE' | 'INFO';
  details: string;
  amount?: number;
  ticker?: string;
}

// Mock data - In a real app, this would come from user settings or backend
const mockAgentStatus = {
  isEnabled: true,
  mode: 'strategy', // or 'full'
  allocatedAmount: 500, // Example amount
  strategy: 'Balanced Approach', // Example strategy if mode is 'strategy'
};

// Mock function to generate random agent actions
const generateMockAction = (lastId: number): AgentAction => {
  const types: AgentAction['type'][] = ['BUY', 'SELL', 'REBALANCE', 'INFO'];
  const tickers = ['AAPL', 'MSFT', 'VOO', 'TSLA', 'AGG', 'XOM', 'GOOGL', 'NVDA'];
  const type = types[Math.floor(Math.random() * types.length)];
  const ticker = tickers[Math.floor(Math.random() * tickers.length)];
  const quantity = Math.floor(Math.random() * 20) + 1;
  const price = (Math.random() * 100 + 50).toFixed(2); // Random price between 50 and 150

  let details = '';
  let amount: number | undefined = undefined;

  switch (type) {
    case 'BUY':
      details = `Executed BUY order for ${quantity} shares of ${ticker} @ $${price}`;
      amount = quantity * parseFloat(price);
      break;
    case 'SELL':
      details = `Executed SELL order for ${quantity} shares of ${ticker} @ $${price}`;
      amount = quantity * parseFloat(price);
      break;
    case 'REBALANCE':
      details = `Rebalanced portfolio according to '${mockAgentStatus.strategy || 'dynamic'}' strategy.`;
      break;
    case 'INFO':
       const infoMessages = [
            `Monitoring market volatility for ${ticker}.`,
            `Adjusting target allocation for ${mockAgentStatus.strategy || 'portfolio'}.`,
            `Analyzed recent news impact on ${ticker}.`,
            `Performance check: Portfolio up 0.5% today.`
       ];
      details = infoMessages[Math.floor(Math.random() * infoMessages.length)];
      break;
  }

  return {
    id: lastId + 1,
    timestamp: new Date(),
    type,
    details,
    amount: amount ? parseFloat(amount.toFixed(2)) : undefined,
    ticker: ['BUY', 'SELL'].includes(type) ? ticker : undefined,
  };
};


export default function PerformanceDisplay() {
  const [agentStatus, setAgentStatus] = useState(mockAgentStatus); // Use mock status for now
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading of actions
    const initialActions: AgentAction[] = [];
    for (let i = 0; i < 5; i++) {
        // Generate slightly older timestamps for initial load
        const action = generateMockAction(initialActions.length > 0 ? initialActions[initialActions.length - 1].id : 0);
        action.timestamp = new Date(Date.now() - (5 - i) * 60000 * Math.random()); // Within last 5 mins
        initialActions.push(action);
    }
    setActions(initialActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())); // Sort descending
    setLoading(false);

    // Simulate real-time updates
    const intervalId = setInterval(() => {
      setActions((prevActions) => {
        const newAction = generateMockAction(prevActions.length > 0 ? prevActions[0].id : 0);
        // Keep max 50 actions for performance
        return [newAction, ...prevActions].slice(0, 50);
      });
    }, 8000); // Add a new action every 8 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);


  const getStatusBadgeVariant = (status: boolean) => {
    return status ? 'default' : 'destructive';
  };

   const getActionIcon = (type: AgentAction['type']) => {
        switch (type) {
            case 'BUY': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'SELL': return <TrendingDown className="h-4 w-4 text-red-500" />;
            case 'REBALANCE': return <Zap className="h-4 w-4 text-blue-500" />;
            case 'INFO': return <Activity className="h-4 w-4 text-gray-500" />;
            default: return <Bot className="h-4 w-4" />;
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
          <CardDescription>Current configuration and operational status of the AI agent.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           <div className="flex items-center space-x-2">
                <span className="font-medium text-muted-foreground">Status:</span>
                {loading ? <Skeleton className="h-6 w-20" /> : (
                    <Badge variant={getStatusBadgeVariant(agentStatus.isEnabled)}>
                    {agentStatus.isEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                )}
           </div>
            <div className="flex items-center space-x-2">
                <span className="font-medium text-muted-foreground">Mode:</span>
                 {loading ? <Skeleton className="h-6 w-24" /> : (
                    <span className="font-semibold flex items-center">
                        {agentStatus.mode === 'full' ? <TrendingUp className="w-4 h-4 mr-1.5"/> : <Zap className="w-4 h-4 mr-1.5"/>}
                        {agentStatus.mode === 'full' ? 'Full Automation' : 'Strategy-Based'}
                    </span>
                 )}
           </div>
           <div className="flex items-center space-x-2">
                <span className="font-medium text-muted-foreground">Allocation:</span>
                 {loading ? <Skeleton className="h-6 w-20" /> : (
                    <span className="font-semibold flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-green-600"/>
                         ${agentStatus.allocatedAmount.toLocaleString()}
                         {agentStatus.mode === 'strategy' && <span className="text-xs text-muted-foreground ml-1">(per strategy)</span>}
                    </span>
                 )}
           </div>
            {agentStatus.mode === 'strategy' && agentStatus.strategy && (
                <div className="flex items-center space-x-2 sm:col-span-2 md:col-span-1">
                    <span className="font-medium text-muted-foreground">Active Strategy:</span>
                     {loading ? <Skeleton className="h-6 w-32" /> : (
                        <span className="font-semibold">{agentStatus.strategy}</span>
                     )}
                </div>
           )}
        </CardContent>
      </Card>

      {/* Action Log Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Activity className="mr-2 text-primary" /> Agent Action Log</CardTitle>
          <CardDescription>Real-time feed of actions taken by the Bill X agent.</CardDescription>
        </CardHeader>
        <CardContent>
           <ScrollArea className="h-[400px] w-full pr-4">
            {loading ? (
                 <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                 </div>
            ) : actions.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No actions recorded yet.</p>
            ) : (
                 <ul className="space-y-3">
                    {actions.map((action) => (
                        <li key={action.id} className="flex items-start space-x-3 border-b pb-3 last:border-b-0">
                            <div className="flex-shrink-0 pt-1">
                                {getActionIcon(action.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{action.details}</p>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" /> {action.timestamp.toLocaleTimeString()} - {action.timestamp.toLocaleDateString()}
                                     {action.amount && (
                                        <span className="ml-2 flex items-center">
                                            <DollarSign className="h-3 w-3 mr-0.5 text-green-600"/>{action.amount.toLocaleString()}
                                        </span>
                                    )}
                                </p>
                            </div>
                            {/* Optionally add a badge for the type */}
                            {/* <Badge variant="secondary" className="text-xs">{action.type}</Badge> */}
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
