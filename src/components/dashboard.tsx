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
import AiSuggestions from './ai-suggestions';
import { SidebarTrigger } from './ui/sidebar';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
    const { toast } = useToast();
    const [referralLink, setReferralLink] = React.useState<string | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = React.useState(false);

    React.useEffect(() => {
      // Placeholder for generating/fetching referral link in a real app
      // This would likely involve a server call
      // For demo, we'll generate a dummy link after a delay
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
           <h1 className="text-2xl font-semibold text-foreground">HIBLLX Dashboard</h1>
        </div>
        {/* Add user profile/settings dropdown here if needed */}
      </header>

      <main className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PortfolioOverview />
          <AiSuggestions />
        </div>

        <div className="lg:col-span-1 space-y-6">
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
               <CardTitle>Market News Summary</CardTitle>
                <CardDescription>AI-powered insights from latest news.</CardDescription>
             </CardHeader>
             <CardContent>
                {/* Placeholder for AI news summary component */}
                <p className="text-sm text-muted-foreground italic">Market news summary coming soon...</p>
             </CardContent>
           </Card>
        </div>
      </main>
    </div>
  );
}
