// @ts-nocheck
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Wrench, BrainCircuit, Lightbulb, Search } from 'lucide-react';
// Placeholder: Import a potential future AI flow
// import { getFinancialKnowledge, FinancialKnowledgeInput, FinancialKnowledgeOutput } from '@/ai/flows/financial-knowledge-flow';

const SkillCard = ({ title, description, icon: Icon }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-lg">
        {Icon && <Icon className="mr-2 h-5 w-5 text-primary" />} {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
      {/* TODO: Link to detailed content or interactive module */}
      <Button variant="link" size="sm" className="p-0 h-auto mt-2">Learn More</Button>
    </CardContent>
  </Card>
);

const ToolCard = ({ title, description, icon: Icon, link }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center text-lg">
        {Icon && <Icon className="mr-2 h-5 w-5 text-primary" />} {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
      {link ? (
        <Button variant="outline" size="sm" asChild className="mt-2">
          <a href={link} target="_blank" rel="noopener noreferrer">Access Tool</a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="mt-2" disabled>Coming Soon</Button>
      )}
    </CardContent>
  </Card>
);

export default function RepositoryContent() {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAi(true);
    setAiResponse(null);
    setAiError(null);

    try {
      // Placeholder for actual AI call
      // const input: FinancialKnowledgeInput = { query: aiQuery };
      // const output: FinancialKnowledgeOutput = await getFinancialKnowledge(input);
      // setAiResponse(output.explanation);

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiResponse(`This is a simulated AI response explaining financial concepts related to: "${aiQuery}". In a real application, this would provide detailed, accurate information leveraging advanced financial knowledge models to enhance your understanding and precision.`);

    } catch (err) {
      console.error("AI Knowledge query failed:", err);
      setAiError(`Failed to get information. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-semibold text-foreground flex items-center">
          <BookOpen className="mr-3 h-7 w-7 text-primary" /> Financial Repository
        </h1>
        <p className="text-muted-foreground mt-1">
          Enhance your skills, explore tools, and leverage AI for financial mastery.
        </p>
      </header>

      {/* Financial Skills Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Lightbulb className="mr-2 h-6 w-6 text-accent" /> Sharpen Your Financial Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkillCard
            title="Understanding Market Indicators"
            description="Learn to interpret key economic indicators (e.g., CPI, GDP, unemployment rates) and their impact on markets."
            icon={TrendingUp} // Example icon
          />
          <SkillCard
            title="Risk Management Techniques"
            description="Explore strategies like diversification, asset allocation, and stop-loss orders to protect your investments."
            icon={ShieldCheck} // Example icon (replace if not available) - using generic placeholder
          />
           <SkillCard
            title="Fundamental Analysis Basics"
            description="Understand how to evaluate a company's financial health by analyzing balance sheets, income statements, and cash flow."
            icon={Briefcase} // Example icon
          />
           {/* Add more SkillCards */}
        </div>
      </section>

       {/* Financial Tools Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
           <Wrench className="mr-2 h-6 w-6 text-accent" /> Financial Tools & Calculators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           <ToolCard
            title="Investment Return Calculator"
            description="Estimate the potential growth of your investments over time based on contributions and expected returns."
            icon={Calculator} // Example icon
            link="#" // Placeholder link
          />
           <ToolCard
            title="Portfolio Backtesting (Simulation)"
            description="Simulate how different portfolio allocations would have performed based on historical market data."
            icon={History} // Example icon
             link={null} // Indicate tool is not yet available/linked
           />
            <ToolCard
            title="Stock Screener"
            description="Filter stocks based on various criteria like market cap, P/E ratio, dividend yield, and sector."
            icon={Filter} // Example icon
            link="#" // Placeholder link
          />
          {/* Add more ToolCards */}
        </div>
      </section>

      {/* AI Knowledge Hub Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
           <BrainCircuit className="mr-2 h-6 w-6 text-accent" /> AI Knowledge Hub
        </h2>
        <Card className="bg-gradient-to-br from-card to-secondary/30">
            <CardHeader>
                <CardTitle>Ask Bill X About Finance</CardTitle>
                <CardDescription>Get AI-powered explanations and insights on financial topics to refine your understanding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex space-x-2">
                    <Input
                        type="text"
                        placeholder="Ask about a financial concept, instrument, or strategy..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                        disabled={loadingAi}
                    />
                    <Button onClick={handleAiQuery} disabled={loadingAi || !aiQuery.trim()}>
                        {loadingAi ? <Skeleton className="h-5 w-5 rounded-full animate-spin" /> : <Search className="h-5 w-5" />}
                         <span className="ml-2">Ask</span>
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
                    <div className="pt-4 border-t mt-4">
                         <h4 className="font-semibold mb-2">Bill X Says:</h4>
                         <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </section>
    </div>
  );
}

// Helper components for icons if needed (replace with actual imports if available)
const TrendingUp = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const ShieldCheck = (props) => ( // Placeholder Icon
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
const Briefcase = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
const Calculator = (props) => (
 <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="16" y1="10" x2="12" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="8" y1="10" x2="8" y2="18"/></svg>
);
const History = (props) => (
 <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
);
const Filter = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);
