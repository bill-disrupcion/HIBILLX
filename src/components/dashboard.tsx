
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PortfolioOverview from './portfolio-overview'; // Shows current holdings
import MarketOverview from './market-overview'; // Shows bond market, indices
import { SidebarTrigger } from './ui/sidebar';
import { Briefcase, Newspaper, Landmark, ArrowRightLeft, CircleDollarSign, AlertTriangle, BookOpen } from 'lucide-react'; // Use relevant icons
import { useToast } from '@/hooks/use-toast';
import { getAccountBalance, AccountBalance, getGovBondYields, GovBondYield } from '@/services/broker-api'; // Import account balance and bond yields
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DepositDialog } from './deposit-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { summarizeMarketNews, SummarizeMarketNewsInput, SummarizeMarketNewsOutput } from '@/ai/flows/summarize-market-news'; // Import news summarizer

// Placeholder components for other sections
const InvestmentTradingOptions = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Governmental Instrument Trading</CardTitle>
      <CardDescription>Explore sovereign bonds, treasury bills, and execute trades. Requires API setup.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground italic">Real Broker API integration required for trading.</p>
       {/* TODO: Add components for searching gov instruments, placing orders */}
       <div className="flex space-x-2 mt-4">
            <Button variant="outline" disabled>Explore Bonds (Needs Impl)</Button>
            <Button variant="outline" disabled>Place Order (Needs Impl)</Button>
        </div>
    </CardContent>
  </Card>
);

const MarketNewsSummary = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual news fetching mechanism
        const mockArticles = [
          "Central Bank signals potential rate hike amid inflation concerns.",
          "Government announces new 10-year bond auction.",
          "Geopolitical tensions rise, impacting global bond markets.",
          "Fiscal policy changes expected in upcoming budget announcement.",
          "Sovereign debt ratings updated for several emerging markets."
        ];
        const input: SummarizeMarketNewsInput = { newsArticles: mockArticles };
        const result: SummarizeMarketNewsOutput = await summarizeMarketNews(input);
        setSummary(result.summary);
      } catch (err: any) {
        console.error("Failed to summarize market news:", err);
        setError(`Failed to load news summary: ${err.message || 'Check AI flow setup.'}`);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    // fetchSummary(); // Uncomment when ready to test/implement news source
    // TEMP: Remove automatic fetch for now as it depends on external data/flow
    setSummary("Market news summary requires API integration and AI flow setup. Example: Central banks considering rate hikes, new bond auctions announced.");
    setLoading(false);


  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Newspaper className="mr-2 h-5 w-5 text-primary" /> Market & Policy News Summary</CardTitle>
        <CardDescription>AI-powered insights from latest relevant news. Requires API/Flow setup.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>News Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : summary ? (
           // Use whitespace-pre-wrap to respect newlines from the AI summary
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No news summary available.</p>
        )}
      </CardContent>
    </Card>
  );
};


export default function Dashboard() {
    const { toast } = useToast();
    const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [balanceError, setBalanceError] = useState<string | null>(null);

    const [isDepositOpen, setIsDepositOpen] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            setLoadingBalance(true);
            setBalanceError(null);
            try {
                const balance = await getAccountBalance();
                setAccountBalance(balance);
            } catch (err: any) {
                console.error("Failed to fetch account balance:", err);
                setBalanceError(`Failed to load balance: ${err.message || 'Check API configuration.'}`);
                setAccountBalance(null);
            } finally {
                setLoadingBalance(false);
            }
        };
        fetchBalance();
    }, []);

    const formatCurrency = useCallback((value: number | undefined, currency: string = 'USD') => {
        if (value === undefined || isNaN(value)) return '--.--';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value);
    }, []);

    const handleOpenDeposit = useCallback(() => {
        setIsDepositOpen(true);
    }, []);

     const handleOpenTransfer = useCallback(() => {
        toast({
            variant: "destructive",
            title: "Transfer Feature Not Implemented",
            description: "Secure backend integration required for fund transfers."
        });
    }, [toast]);

     const handleOpenWithdraw = useCallback(() => {
        toast({
            variant: "destructive",
            title: "Withdraw Feature Not Implemented",
            description: "Secure backend integration required for fund withdrawals."
        });
    }, [toast]);


  return (
    <>
    <div className="flex flex-col min-h-screen p-4 md:p-6 lg:p-8 space-y-6 bg-background">
      <header className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center space-x-2">
           <SidebarTrigger className="md:hidden"/>
           <h1 className="text-2xl font-semibold text-foreground">Governmental Trading Dashboard</h1>
        </div>
         <div className="text-right">
              <p className="text-xs text-muted-foreground">Institutional Account Balance</p>
              {loadingBalance ? (
                  <Skeleton className="h-6 w-32 mt-1" />
              ) : balanceError ? (
                   <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger asChild>
                               <span className="text-sm font-semibold text-destructive flex items-center justify-end cursor-help">
                                   <AlertTriangle className="h-4 w-4 mr-1"/> Error
                               </span>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>{balanceError}</p>
                          </TooltipContent>
                      </Tooltip>
                   </TooltipProvider>
              ) : accountBalance ? (
                   <p className="text-lg font-semibold">{formatCurrency(accountBalance.cash, accountBalance.currency)}</p>
              ) : (
                   <p className="text-sm font-semibold text-muted-foreground">N/A</p>
              )}
          </div>
      </header>

      <main className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <PortfolioOverview />
           <MarketOverview /> {/* Will show bond market / yield curves */}
           <InvestmentTradingOptions />
        </div>

        <div className="lg:col-span-1 space-y-6">
           <Card>
                <CardHeader>
                    <CardTitle>Treasury Operations</CardTitle>
                    <CardDescription>Manage institutional funds. Requires backend setup.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button className="w-full" onClick={handleOpenDeposit}>
                        <Landmark className="mr-2 h-4 w-4" /> Deposit Funds
                    </Button>
                     <Button className="w-full" variant="outline" onClick={handleOpenTransfer} disabled>
                         <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Funds (Needs Backend)
                     </Button>
                     <Button className="w-full" variant="outline" onClick={handleOpenWithdraw} disabled>
                        <CircleDollarSign className="mr-2 h-4 w-4" /> Withdraw Funds (Needs Backend)
                     </Button>
                     <p className="text-xs text-muted-foreground text-center pt-2">Secure backend implementation required.</p>
                </CardContent>
           </Card>

           <MarketNewsSummary />

            {/* Financial Knowledge Hub Access Point */}
           <Card>
               <CardHeader>
                 <CardTitle className="flex items-center">
                   <BookOpen className="mr-2 h-5 w-5 text-primary" /> Financial Knowledge Base
                 </CardTitle>
                 <CardDescription>Access AI-powered financial explanations.</CardDescription>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground mb-3">
                   Use the "Bill X" section to query the AI about financial concepts, instruments, strategies, and market dynamics.
                 </p>
                 <Button variant="outline" className="w-full" onClick={() => window.location.href='/bill-x'}> {/* Simple navigation */}
                   Go to Bill X AI
                 </Button>
               </CardContent>
           </Card>

        </div>
      </main>
    </div>

     <DepositDialog isOpen={isDepositOpen} onOpenChange={setIsDepositOpen} />
    </>
  );
}
