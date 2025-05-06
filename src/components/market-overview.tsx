

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMarketData, getGovBondYields, type Instrument, type MarketData, type GovBondYield, ApiError, DataProviderError, ValidationError } from '@/services/broker-api'; // Import custom errors
import { TrendingUp, TrendingDown, AlertTriangle, Minus, BarChartBig, Info } from 'lucide-react'; // Use relevant icons
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Relevant indices for government context (examples)
const relevantIndices = [
    { ticker: '^FVX', name: '5-Year Treasury Yield' },
    { ticker: '^TNX', name: '10-Year Treasury Yield' },
    { ticker: '^TYX', name: '30-Year Treasury Yield' },
    { ticker: 'AGG', name: 'US Aggregate Bond ETF' },
];

export default function MarketOverview() {
  const { toast } = useToast();
  const [indicesData, setIndicesData] = useState<(MarketData & { name: string })[] | null>(null);
  const [bondYields, setBondYields] = useState<GovBondYield[] | null>(null);
  const [loadingIndices, setLoadingIndices] = useState(true);
  const [loadingYields, setLoadingYields] = useState(true);
  const [errorIndices, setErrorIndices] = useState<string | null>(null);
  const [errorYields, setErrorYields] = useState<string | null>(null);
  const [partialIndexDataWarning, setPartialIndexDataWarning] = useState<string | null>(null);

  const formatPercent = useCallback((value: number | undefined, decimals: number = 2) => {
    if (value === undefined || isNaN(value)) return '--.--%';
    return `${value.toFixed(decimals)}%`;
  }, []);

  const formatBasisPoints = useCallback((value: number | undefined) => {
     if (value === undefined || isNaN(value)) return '-- bps';
     const bps = value * 100; // Bond yields are typically in percent, so changeValue is also in percent points
     return `${bps >= 0 ? '+' : ''}${bps.toFixed(1)} bps`;
  }, []);

  const getChangeColor = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return 'text-muted-foreground';
    // For yields, an increase is generally "bad" (red), decrease is "good" (green)
    if (value > 0.0001) return 'text-red-600 dark:text-red-500'; // Yield up
    if (value < -0.0001) return 'text-green-600 dark:text-green-500'; // Yield down
    return 'text-muted-foreground';
  };

  const getChangeIcon = (value: number | undefined) => {
     if (value === undefined || isNaN(value)) return <Minus className="h-4 w-4 text-muted-foreground" />;
     if (value > 0.0001) return <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-500" />;
     if (value < -0.0001) return <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-500" />;
     return <Minus className="h-4 w-4 text-muted-foreground" />;
   };

  // Fetch Index Data (Treasury Yields via Market Data) with Error Handling
  useEffect(() => {
    const fetchIndices = async () => {
      setLoadingIndices(true);
      setErrorIndices(null);
      setPartialIndexDataWarning(null); // Reset warning
      try {
        const indexDataPromises = relevantIndices.map(async (index) => {
          try {
              const data = await getMarketData(index.ticker);
              return { ...data, name: index.name }; // Add name back
          } catch (err: any) {
              // Log individual errors but don't fail the whole batch immediately
              console.warn(`Failed to fetch index data for ${index.ticker}: ${err.message}`);
              return { ticker: index.ticker, name: index.name, error: err.message } as any; // Return error information
          }
        });
        const results = await Promise.allSettled(indexDataPromises); // Use allSettled

        const fetchedIndices: (MarketData & { name: string })[] = [];
        const errors: string[] = [];

        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value && !result.value.error) {
                // Check if value is not the error object we might return
                fetchedIndices.push(result.value as MarketData & { name: string });
            } else {
                const ticker = relevantIndices[i].ticker;
                const reason = result.status === 'rejected'
                    ? (result.reason?.message || 'Unknown rejection')
                    : (result.value?.error || 'Unknown fulfillment error');
                errors.push(`${ticker}: ${reason}`);
            }
        });

        setIndicesData(fetchedIndices); // Set successfully fetched data

        if (errors.length > 0) {
             const errorMsg = `Could not load data for ${errors.length} index/indices. ${errors.join('; ')}`;
             if (fetchedIndices.length === 0) {
                 // If all failed, set a critical error
                 setErrorIndices(errorMsg);
                 toast({ variant: "destructive", title: "Indices Error", description: "Failed to load all index data." });
             } else {
                 // If some succeeded, set a partial data warning
                 setPartialIndexDataWarning(errorMsg);
                 toast({ variant: "warning", title: "Partial Index Data", description: `Could not load data for ${errors.length} index/indices.` });
             }
        }

      } catch (err: any) { // Catch errors in the overall process, though allSettled should handle most
        console.error("General error fetching index data:", err);
        setErrorIndices(err.message || 'An unexpected error occurred loading index data.');
        setIndicesData([]); // Set empty array on general error
        toast({ variant: "destructive", title: "Indices Error", description: err.message || 'An unexpected error occurred.' });
      } finally {
        setLoadingIndices(false);
      }
    };
    fetchIndices();
  }, [toast]); // Added toast dependency

  // Fetch Government Bond Yields with Error Handling
  useEffect(() => {
    const fetchYields = async () => {
      setLoadingYields(true);
      setErrorYields(null);
      try {
        const fetchedYields = await getGovBondYields();
        setBondYields(fetchedYields);
      } catch (err: any) {
        console.error("Failed to fetch government bond yields:", err);
        let errorMessage = `Failed to load bond yields.`;
        if (err instanceof DataProviderError) {
            errorMessage = `Yield Data Error: ${err.message}`;
        } else if (err instanceof ApiError) {
            errorMessage = `Yield API Error: ${err.message}`;
        } else {
             errorMessage += ` ${err.message || 'Check API implementation.'}`;
        }
        setErrorYields(errorMessage);
        setBondYields([]); // Set empty array on error
        toast({ variant: "destructive", title: "Yield Curve Error", description: errorMessage });
      } finally {
        setLoadingYields(false);
      }
    };
    fetchYields();
  }, [toast]); // Added toast dependency

  const handleItemClick = useCallback((ticker: string, name: string) => {
    console.log(`Clicked on ${name} (${ticker})`);
    // Here you would typically navigate to a detailed view or update a chart
    toast({
        title: `Viewing ${name}`,
        description: "Detailed view/chart functionality requires implementation.",
    });
  }, [toast]); // Added toast

  const renderIndexCard = (index: MarketData & { name: string }) => (
     <div
         key={index.ticker}
         className="flex flex-col p-3 border rounded-md bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-150 cursor-pointer"
         onClick={() => handleItemClick(index.ticker, index.name)}
         tabIndex={0}
         onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleItemClick(index.ticker, index.name)}
         role="button"
         aria-label={`View details for ${index.name}`}
     >
         <span className="text-xs font-medium text-muted-foreground">{index.name} ({index.ticker})</span>
         <span className="text-lg font-semibold mt-1">{formatPercent(index.price)}</span>
         <div className={`flex items-center text-sm mt-0.5 ${getChangeColor(index.changeValue)}`}>
              {getChangeIcon(index.changeValue)}
              <span className="ml-1 font-medium">{formatBasisPoints(index.changeValue)}</span>
              <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <button className="ml-1.5 p-0 appearance-none border-none bg-transparent cursor-help" aria-label="Show more info">
                           <Info className="h-3 w-3 text-muted-foreground" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>Change: {index.changeValue?.toFixed(4) ?? 'N/A'}%</p>
                       <p>% Change: {formatPercent(index.changePercent)}</p>
                       <p>Prev Close: {formatPercent(index.previousClose)}</p>
                       {index.volume && <p>Volume: {index.volume.toLocaleString()}</p>}
                    </TooltipContent>
                 </Tooltip>
              </TooltipProvider>
         </div>
     </div>
  );

   const renderYieldCurveTable = (data: GovBondYield[] | undefined | null) => (
      <div>
          <h4 className="text-md font-semibold mb-2">Treasury Yield Curve</h4>
           {loadingYields ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
           ) : errorYields ? (
               <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Yield Curve Error</AlertTitle>
                  <AlertDescription>{errorYields}</AlertDescription>
               </Alert>
           ) : !data || data.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Yield curve data unavailable.</p>
           ) : (
              <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="p-1.5">Maturity</TableHead>
                      <TableHead className="text-right p-1.5">Yield</TableHead>
                      <TableHead className="text-right p-1.5">Change (bps)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {data.map((yieldData) => (
                          <TableRow
                              key={yieldData.maturity}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleItemClick(yieldData.maturity, `${yieldData.maturity} Treasury`)}
                              tabIndex={0}
                              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleItemClick(yieldData.maturity, `${yieldData.maturity} Treasury`)}
                              role="button"
                              aria-label={`View details for ${yieldData.maturity} Treasury`}
                          >
                              <TableCell className="font-medium p-1.5">{yieldData.maturity}</TableCell>
                              <TableCell className="text-right p-1.5 font-semibold">{formatPercent(yieldData.yield)}</TableCell>
                              <TableCell className={`text-right p-1.5 font-medium ${getChangeColor(yieldData.change)}`}>
                                  {formatBasisPoints(yieldData.change)}
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
           )}
      </div>
  );

  // Combine error and warning for display
  const displayError = errorIndices || errorYields;
  const displayWarning = partialIndexDataWarning;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
           <BarChartBig className="mr-2 h-5 w-5 text-primary" /> Market & Yield Overview
        </CardTitle>
        <CardDescription>Key treasury yields and relevant market indices. Requires API setup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display combined error or warning */}
        {displayError && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Data Loading Error</AlertTitle>
                <AlertDescription>{displayError}</AlertDescription>
             </Alert>
        )}
        {displayWarning && !displayError && ( // Show warning only if no critical error
            <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Partial Data Warning</AlertTitle>
                <AlertDescription>{displayWarning}</AlertDescription>
            </Alert>
        )}

        {/* Major Indices/Yields */}
        <div>
           <h3 className="text-lg font-semibold mb-3">Key Rates & Indices</h3>
            {loadingIndices ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                         <div key={i} className="flex flex-col p-3 border rounded-md bg-muted/30 space-y-1.5">
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                 </div>
            ) : errorIndices && (!indicesData || indicesData.length === 0) ? (
                // Show error message inline only if loading finished and there's a critical error with no data
                 <p className="text-sm text-destructive italic">Failed to load index data.</p>
            ) : indicesData && indicesData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {indicesData.map((idx) => renderIndexCard(idx as MarketData & { name: string }))}
                </div>
            ) : (
                 !errorIndices && <p className="text-sm text-muted-foreground italic">Index data unavailable.</p> // Show unavailable only if no error
            )}
        </div>

        {/* Yield Curve Table */}
         <div className="pt-4 border-t">
             {/* renderYieldCurveTable handles its own loading/error display */}
             {renderYieldCurveTable(bondYields)}
         </div>

      </CardContent>
    </Card>
  );
}

    