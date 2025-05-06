
'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Added useState, useEffect, useCallback
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PortfolioOverview from './portfolio-overview';
import MarketOverview from './market-overview';
import { SidebarTrigger } from './ui/sidebar';
import { Share2, Briefcase, Newspaper, Landmark, ArrowRightLeft, CircleDollarSign, AlertTriangle } from 'lucide-react'; // Added finance icons, AlertTriangle
import { useToast } from '@/hooks/use-toast';
import { getAccountBalance, AccountBalance } from '@/services/broker-api'; // Import account balance
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For errors
import { DepositDialog } from './deposit-dialog'; // Import the DepositDialog
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip


// Placeholder components for other sections (kept for context)
const InvestmentTradingOptions = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Investment & Trading</CardTitle>
      <CardDescription>Explore investment options and execute trades.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground italic">Investment and trading requires real Broker API integration.</p>
       {/* TODO: Add components for searching instruments (using getInstruments), placing orders (using submitOrder) */}
       <div className="flex space-x-2 mt-4">
            <Button variant="outline" disabled>Explore Stocks (Needs Impl)</Button>
            <Button variant="outline" disabled>Place Order (Needs Impl)</Button>
        </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
    const { toast } = useToast();
    const [referralLink, setReferralLink] = useState<string | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false); // Kept for mock referral link
    const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [balanceError, setBalanceError] = useState<string | null>(null);

     // State for modal dialogs
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    // Placeholder states for Transfer/Withdraw - These will require backend implementation
    // const [isTransferOpen, setIsTransferOpen] = useState(false);
    // const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    // Fetch Account Balance - Now attempts real API call via broker-api.ts
    useEffect(() => {
        const fetchBalance = async () => {
            setLoadingBalance(true);
            setBalanceError(null);
            try {
                // This function will now throw an error if the real API isn't implemented/configured
                const balance = await getAccountBalance();
                setAccountBalance(balance);
            } catch (err: any) {
                console.error("Failed to fetch account balance:", err);
                setBalanceError(`Failed to load balance: ${err.message || 'Check API configuration and implementation.'}`);
                setAccountBalance(null);
            } finally {
                setLoadingBalance(false);
            }
        };
        fetchBalance();
    }, []); // Fetch once on mount


    // Generate Referral Link (kept as mock for now)
    useEffect(() => {
      if (!referralLink && !isGeneratingLink) {
        setIsGeneratingLink(true);
        setTimeout(() => {
          const dummyLink = `https://hibllx.app/ref/${Math.random().toString(36).substring(7)}`;
          setReferralLink(dummyLink);
          setIsGeneratingLink(false);
        }, 1500);
      }
    }, [referralLink, isGeneratingLink]);

    const formatCurrency = useCallback((value: number | undefined, currency: string = 'USD') => {
        if (value === undefined || isNaN(value)) return '--.--';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value);
    }, []);


   const handleReferralClick = useCallback(() => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
        .then(() => {
          toast({
            title: "Referral Link Copied!",
            description: "Share it with your friends.",
          });
        })
        .catch(err => {
          console.error('Failed to copy referral link: ', err);
          toast({
            title: "Failed to Copy Link",
            description: "Please try copying manually.",
            variant: "destructive",
          });
        });
    } else {
       toast({
            title: "Generating Link...",
            description: "Please wait a moment.",
          });
    }
   }, [referralLink, toast]);

    // Handlers for modal dialogs
    const handleOpenDeposit = useCallback(() => {
        // Check if backend is implemented - this is conceptual, real check is in initiateDeposit
        // For now, just open the dialog, but warn user if initiateDeposit fails.
        setIsDepositOpen(true);
    }, []);

     const handleOpenTransfer = useCallback(() => {
        // setIsTransferOpen(true); // Keep commented until backend implemented
        toast({
            variant: "destructive",
            title: "Transfer Feature Not Implemented",
            description: "This requires backend integration for fund movement."
        });
    }, [toast]);

     const handleOpenWithdraw = useCallback(() => {
        // setIsWithdrawOpen(true); // Keep commented until backend implemented
        toast({
            variant: "destructive",
            title: "Withdraw Feature Not Implemented",
            description: "This requires backend integration for fund withdrawal."
        });
    }, [toast]);


  return (
    <>
    <div className="flex flex-col min-h-screen p-4 md:p-6 lg:p-8 space-y-6 bg-background">
      <header className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center space-x-2">
           <SidebarTrigger className="md:hidden"/>
           <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        </div>
        {/* Account Balance Display */}
         <div className="text-right">
              <p className="text-xs text-muted-foreground">Account Balance</p>
              {loadingBalance ? (
                  <Skeleton className="h-6 w-24 mt-1" />
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
           {/* PortfolioOverview and MarketOverview now attempt real API calls */}
           <PortfolioOverview />
           <MarketOverview />
           <InvestmentTradingOptions />
        </div>

        <div className="lg:col-span-1 space-y-6">
           {/* Account Actions Card */}
           <Card>
                <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>Manage your funds. Requires backend setup.</CardDescription>
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
                     <p className="text-xs text-muted-foreground text-center pt-2">Transfer and Withdraw require backend implementation.</p>
                </CardContent>
           </Card>


           {/* Referral Program Card (Still Mock) */}
           <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Invite friends and earn rewards!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share your unique referral link with friends. When they sign up and invest, you both get rewarded.
              </p>
              {isGeneratingLink ? (
                 <Skeleton className="h-10 w-full" />
              ) : referralLink ? (
                 <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-grow p-2 border rounded-md text-sm bg-muted text-muted-foreground"
                    aria-label="Referral Link"
                  />
                  <Button size="icon" variant="outline" onClick={handleReferralClick} title="Copy Referral Link">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                 <p className="text-sm text-muted-foreground italic">Could not generate referral link.</p>
              )}
               <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleReferralClick} disabled={!referralLink || isGeneratingLink}>
                <Share2 className="mr-2 h-4 w-4" /> Copy Referral Link
              </Button>
            </CardContent>
          </Card>

          {/* Market News Summary Card (Placeholder) */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center"><Newspaper className="mr-2 h-5 w-5 text-primary" /> Market News Summary</CardTitle>
                <CardDescription>AI-powered insights from latest news.</CardDescription>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground italic">Market news summary requires API integration.</p>
                 {/* TODO: Integrate summarizeMarketNews flow here after configuring a news API */}
             </CardContent>
           </Card>
        </div>
      </main>
    </div>

     {/* Deposit Dialog */}
      <DepositDialog isOpen={isDepositOpen} onOpenChange={setIsDepositOpen} />
      {/* Transfer/Withdraw dialogs would go here when implemented */}
    </>
  );
}
