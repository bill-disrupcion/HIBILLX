'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Wand2 } from 'lucide-react';

import { analyzeInvestmentOptions, AnalyzeInvestmentOptionsInput, AnalyzeInvestmentOptionsOutput } from '@/ai/flows/analyze-investment-options';
import { suggestTradingStrategies, SuggestTradingStrategiesInput, SuggestTradingStrategiesOutput } from '@/ai/flows/suggest-trading-strategies';
import { diversifyPortfolio, DiversifyPortfolioInput, DiversifyPortfolioOutput } from '@/ai/flows/diversify-portfolio';


type AiTask = 'analyze' | 'suggest' | 'diversify';
type AiResult = AnalyzeInvestmentOptionsOutput | SuggestTradingStrategiesOutput | DiversifyPortfolioOutput | null;

export default function AiSuggestions() {
  const [selectedTask, setSelectedTask] = useState<AiTask>('analyze');
  const [riskProfile, setRiskProfile] = useState<string>('moderate');
  const [financialGoals, setFinancialGoals] = useState<string>('long-term growth');
  const [investmentAmount, setInvestmentAmount] = useState<string>('10000');
  const [preferredInstruments, setPreferredInstruments] = useState<string>(''); // Comma-separated for simplicity

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid positive investment amount.');
      setLoading(false);
      return;
    }

    try {
      let aiResponse: AiResult = null;
      if (selectedTask === 'analyze') {
        const input: AnalyzeInvestmentOptionsInput = {
          riskProfile,
          financialGoals,
          investmentAmount: amount,
        };
        aiResponse = await analyzeInvestmentOptions(input);
      } else if (selectedTask === 'suggest') {
        const input: SuggestTradingStrategiesInput = {
          investmentAmount: amount,
          riskTolerance: riskProfile as 'low' | 'medium' | 'high', // Assuming riskProfile maps directly for simplicity
          preferredInstruments: preferredInstruments ? preferredInstruments.split(',').map(s => s.trim()) : undefined,
        };
         aiResponse = await suggestTradingStrategies(input);
      } else if (selectedTask === 'diversify') {
        const input: DiversifyPortfolioInput = {
           investmentAmount: amount,
           riskTolerance: riskProfile,
        };
         aiResponse = await diversifyPortfolio(input);
      }
      setResult(aiResponse);
    } catch (err) {
      console.error(`AI Task (${selectedTask}) failed:`, err);
      setError(`Failed to generate suggestions. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

   const renderResult = () => {
    if (!result) return null;

    if ('investmentOptions' in result) { // AnalyzeInvestmentOptionsOutput
      return (
        <div>
          <h4 className="font-semibold mb-2">Investment Options:</h4>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            {result.investmentOptions.map((opt, index) => (
              <li key={index}>
                <strong>{opt.name} ({opt.ticker})</strong>: Allocate {opt.percentage}%
                <p className="text-sm text-muted-foreground">{opt.reason}</p>
              </li>
            ))}
          </ul>
           <h4 className="font-semibold mb-2">Summary:</h4>
           <p className="text-sm">{result.summary}</p>
        </div>
      );
    }

    if ('strategies' in result) { // SuggestTradingStrategiesOutput
       return (
        <div>
           <h4 className="font-semibold mb-2">Suggested Strategies:</h4>
           <div className="space-y-4 mb-4">
             {result.strategies.map((strat, index) => (
               <div key={index} className="p-3 border rounded-md">
                 <h5 className="font-medium">{strat.name} <span className={`text-xs px-1.5 py-0.5 rounded bg-muted ${strat.riskLevel === 'high' ? 'text-red-600' : strat.riskLevel === 'medium' ? 'text-orange-500' : 'text-green-600'}`}>{strat.riskLevel} risk</span></h5>
                 <p className="text-sm text-muted-foreground mb-1">{strat.description}</p>
                 <p className="text-sm">Instruments: {strat.instruments.join(', ')}</p>
                 <p className="text-sm">Expected Return: {strat.expectedReturn.toFixed(2)}%</p>
                 {/* Display allocation if needed */}
               </div>
             ))}
           </div>
            <h4 className="font-semibold mb-2">Summary:</h4>
            <p className="text-sm">{result.summary}</p>
        </div>
      );
    }

     if ('portfolioAllocation' in result) { // DiversifyPortfolioOutput
      const allocation = result.portfolioAllocation;
      return (
        <div>
           <h4 className="font-semibold mb-2">Diversification Strategy:</h4>
           <p className="text-sm text-muted-foreground mb-4">{result.strategyExplanation}</p>
           <h4 className="font-semibold mb-2">Recommended Allocation:</h4>
           <ul className="list-disc pl-5 space-y-1">
                {Object.entries(allocation).map(([asset, percentage]) => (
                  <li key={asset}>
                    <strong>{asset}:</strong> {percentage.toFixed(2)}%
                  </li>
                ))}
           </ul>
        </div>
      );
    }

    return <p>Unexpected result format.</p>;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
           <Wand2 className="mr-2 text-primary" /> AI Finance Pilot Suggestions
        </CardTitle>
        <CardDescription>
          Leverage AI to analyze options, suggest strategies, or diversify your portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Selection */}
        <div className="space-y-2">
          <Label htmlFor="ai-task">Select AI Task</Label>
          <Select value={selectedTask} onValueChange={(value) => setSelectedTask(value as AiTask)}>
            <SelectTrigger id="ai-task">
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analyze">Analyze Investment Options</SelectItem>
              <SelectItem value="suggest">Suggest Trading Strategies</SelectItem>
              <SelectItem value="diversify">Diversify Portfolio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Common Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="risk-profile">Risk Profile</Label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger id="risk-profile">
                <SelectValue placeholder="Select risk profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
                 {/* Map 'low', 'medium', 'high' for SuggestTradingStrategies */}
                <SelectItem value="low">Low (for Strategy)</SelectItem>
                <SelectItem value="medium">Medium (for Strategy)</SelectItem>
                <SelectItem value="high">High (for Strategy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="investment-amount">Investment Amount ($)</Label>
            <Input
              id="investment-amount"
              type="number"
              placeholder="e.g., 10000"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              min="1"
            />
          </div>
        </div>

        {/* Task Specific Inputs */}
        {selectedTask === 'analyze' && (
          <div className="space-y-2">
            <Label htmlFor="financial-goals">Financial Goals</Label>
            <Textarea
              id="financial-goals"
              placeholder="e.g., Retirement savings, buy a house in 5 years"
              value={financialGoals}
              onChange={(e) => setFinancialGoals(e.target.value)}
            />
          </div>
        )}

        {selectedTask === 'suggest' && (
          <div className="space-y-2">
            <Label htmlFor="preferred-instruments">Preferred Instruments (Optional, comma-separated)</Label>
            <Input
              id="preferred-instruments"
              placeholder="e.g., AAPL, GOOGL, VOO"
              value={preferredInstruments}
              onChange={(e) => setPreferredInstruments(e.target.value)}
            />
             <p className="text-xs text-muted-foreground">Leave blank to consider all available instruments.</p>
          </div>
        )}

        {/* Diversify task doesn't have extra specific inputs in this setup */}


        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate Suggestions
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">AI Generated Result:</h3>
             <div className="p-4 bg-muted/50 rounded-md">
                {renderResult()}
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
