'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PortfolioOverview from './portfolio-overview';
// AiSuggestions is removed from the main dashboard
// import AiSuggestions from './ai-suggestions';
import { SidebarTrigger } from './ui/sidebar';
import { Share2, TrendingUp, Briefcase, Newspaper } from 'lucide-react'; // Added icons
import { useToast } from '@/hooks/use-toast';

// Placeholder components for new dashboard sections
const MarketOverview = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" /> Market Overview</CardTitle>
      <CardDescription>Live market trends and indices.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground italic">Market overview section coming soon...</p>
      {/* TODO: Add actual market data display (e.g., charts, index values) */}
    </CardContent>
  </Card>
);

const InvestmentTradingOptions = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Investment & Trading</CardTitle>
      <CardDescription>Explore investment options and execute trades.</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground italic">Investment and trading options coming soon...</p>
       {/* TODO: Add components for searching instruments, placing orders, viewing options */}
       <div className="flex space-x-2 mt-4">
            <Button variant="outline">Explore Stocks</Button>
            <Button variant="outline">Place Order</Button>
        </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
    const { toast } = useToast();
    const [referralLink, setReferralLink] = React.useState<string | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = React.useState(false);

    React.useEffect(() => {
      // Placeholder for generating/fetching referral link in a real app
      if (!referralLink && !isGeneratingLink) {
        setIsGeneratingLink(true);
        setTimeout(() => {
          const dummyLink = `https://hibllx.app/ref/${Math.random().toString(36).substring(7)}`;
          setReferralLink(dummyLink);
          setIsGeneratingLink(false);
        }, 1500); // Simulate network delay
      }
    }, [referralLink, isGeneratingLink]);


   const handleReferralClick = () => {
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
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 lg:p-8 space-y-6 bg-background">
      <header className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center space-x-2">
           <SidebarTrigger className="md:hidden"/>
           <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        </div>
        {/* Add user profile/settings dropdown here if needed */}
      </header>

      <main className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           {/* Main Dashboard Content */}
           <PortfolioOverview />
           <MarketOverview />
           <InvestmentTradingOptions />
          {/* AiSuggestions component is removed from here */}
        </div>

        <div className="lg:col-span-1 space-y-6">
           {/* Sidebar Widgets */}
           <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Invite friends and earn rewards!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Share your unique referral link with friends. When they sign up and invest, you both get rewarded.
              </p>
              {referralLink ? (
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
                 <p className="text-sm text-muted-foreground italic">Generating your referral link...</p>
              )}
              {/* Add loyalty status/progress bar here if applicable */}
               <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleReferralClick} disabled={!referralLink}>
                <Share2 className="mr-2 h-4 w-4" /> Copy Referral Link
              </Button>
            </CardContent>
          </Card>

           <Card>
             <CardHeader>
               <CardTitle className="flex items-center"><Newspaper className="mr-2 h-5 w-5 text-primary" /> Market News Summary</CardTitle>
                <CardDescription>AI-powered insights from latest news.</CardDescription>
             </CardHeader>
             <CardContent>
                {/* TODO: Placeholder for AI news summary component/feature */}
                <p className="text-sm text-muted-foreground italic">Market news summary coming soon...</p>
                 {/* You would integrate the summarizeMarketNews flow here */}
             </CardContent>
           </Card>
        </div>
      </main>
    </div>
  );
}
