
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
import { getMarketData, getGovBondYields, type Instrument, type MarketData, type GovBondYield } from '@/services/broker-api'; // Fetch bond yields
import { TrendingUp, TrendingDown, AlertTriangle, Minus, BarChartBig, Info } from 'lucide-react'; // Use relevant icons
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Relevant indices for government context (examples)
const relevantIndices = [
    { ticker: '^FVX', name: '5-Year Treasury Yield' }, // CBOE Interest Rate 5-Year T-Note
    { ticker: '^TNX', name: '10-Year Treasury Yield' }, // CBOE Interest Rate 10-Year T-Note
    { ticker: '^TYX', name: '30-Year Treasury Yield' }, // CBOE Interest Rate 30-Year T-Bond
    // Add other relevant indices like LIBOR, SOFR proxies if needed, or major bond ETFs
    { ticker: 'AGG', name: 'US Aggregate Bond ETF' },
];

export default function MarketOverview() {
  const { toast } = useToast();
  const [indicesData, setIndicesData] = useState<MarketData[] | null>(null);
  const [bondYields, setBondYields] = useState<GovBondYield[] | null>(null);
  const [loadingIndices, setLoadingIndices] = useState(true);
  const [loadingYields, setLoadingYields] = useState(true);
  const [errorIndices, setErrorIndices] = useState<string | null>(null);
  const [errorYields, setErrorYields] = useState<string | null>(null);

  const formatPercent = useCallback((value: number | undefined, decimals: number = 2) => {
    if (value === undefined || isNaN(value)) return '--.--%';
    return `${value.toFixed(decimals)}%`;
  }, []);

  const formatBasisPoints = useCallback((value: number | undefined) => {
     if (value === undefined || isNaN(value)) return '-- bps';
     const bps = value * 100; // Assuming change is in percentage points, convert to bps
     return `${bps >= 0 ? '+' : ''}${bps.toFixed(1)} bps`;
  }, []);

  const getChangeColor = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return 'text-muted-foreground';
    if (value > 0.0001) return 'text-red-600 dark:text-red-500'; // Higher yield = red (often)
    if (value < -0.0001) return 'text-green-600 dark:text-green-500'; // Lower yield = green (often)
    return 'text-muted-foreground';
  };

  const getChangeIcon = (value: number | undefined) => {
     if (value === undefined || isNaN(value)) return <Minus className="h-4 w-4 text-muted-foreground" />;
     if (value > 0.0001) return <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-500" />; // Higher yield
     if (value < -0.0001) return <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-500" />; // Lower yield
     return <Minus className="h-4 w-4 text-muted-foreground" />;
   };

  // Fetch Index Data (Treasury Yields via Market Data)
  useEffect(() => {
    const fetchIndices = async () => {
      setLoadingIndices(true);
      setErrorIndices(null);
      try {
        const indexDataPromises = relevantIndices.map(async (index) => {
          const data = await getMarketData(index.ticker);
          return { ...data, name: index.name }; // Add name back
        });
        const results = await Promise.allSettled(indexDataPromises);
        const fetchedIndices: MarketData[] = [];
        const errors: string[] = [];
        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && result.value) {
                fetchedIndices.push(result.value);
            } else {
                console.error(`Failed to fetch index data for ${relevantIndices[i].ticker}:`, result.status === 'rejected' ? result.reason : 'No data');
                errors.push(`${relevantIndices[i].ticker}: ${result.status === 'rejected' ? (result.reason?.message || 'Error') : 'No data'}`);
            }
        });
        setIndicesData(fetchedIndices);
        if (errors.length > 0) {
             const errorMsg = `Could not load data for some indices (${errors.length} failed). ${errors[0]}`;
             setErrorIndices(errorMsg);
             if (fetchedIndices.length === 0) setIndicesData([]); // Ensure it's an empty array if all failed
        }
      } catch (err: any) {
        console.error("General error fetching index data:", err);
        setErrorIndices(err.message || 'An unexpected error occurred loading index data.');
        setIndicesData([]); // Set empty array on general error
      } finally {
        setLoadingIndices(false);
      }
    };
    fetchIndices();
  }, []);

  // Fetch Government Bond Yields
  useEffect(() => {
    const fetchYields = async () => {
      setLoadingYields(true);
      setErrorYields(null);
      try {
        const fetchedYields = await getGovBondYields(); // Assuming this fetches a standard set (e.g., US Treasuries)
        setBondYields(fetchedYields);
      } catch (err: any) {
        console.error("Failed to fetch government bond yields:", err);
        setErrorYields(`Failed to load bond yields: ${err.message || 'Check API implementation.'}`);
        setBondYields([]); // Set empty array on error
      } finally {
        setLoadingYields(false);
      }
    };
    fetchYields();
  }, []);

  const handleItemClick = useCallback((ticker: string, name: string) => {
    console.log(`Clicked on ${name} (${ticker})`);
    toast({
        title: `Viewing ${name}`,
        description: "Detailed view/chart functionality requires implementation.",
    });
  }, [toast]);

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
          {/* For yields, display as percentage */}
         <span className="text-lg font-semibold mt-1">{formatPercent(index.price)}</span>
         <div className={`flex items-center text-sm mt-0.5 ${getChangeColor(index.changeValue)}`}>
              {getChangeIcon(index.changeValue)}
               {/* Display change in basis points */}
              <span className="ml-1 font-medium">{formatBasisPoints(index.changeValue)}</span>
              <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger>
                         <Info className="h-3 w-3 text-muted-foreground ml-1.5 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                       <p>Change: {index.changeValue?.toFixed(4)}%</p>
                       <p>% Change: {formatPercent(index.changePercent)}</p>
                       <p>Prev Close: {formatPercent(index.previousClose)}</p>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
           <BarChartBig className="mr-2 h-5 w-5 text-primary" /> Market & Yield Overview
        </CardTitle>
        <CardDescription>Key treasury yields and relevant market indices. Requires API setup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            ) : errorIndices ? (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Indices Error</AlertTitle>
                    <AlertDescription>{errorIndices}</AlertDescription>
                 </Alert>
            ) : indicesData && indicesData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {indicesData.map((idx) => renderIndexCard(idx as MarketData & { name: string }))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic">Index data unavailable.</p>
            )}
        </div>

        {/* Yield Curve Table */}
         <div className="pt-4 border-t">
             {renderYieldCurveTable(bondYields)}
         </div>

         {/* Removed Top Movers Section */}

      </CardContent>
    </Card>
  );
}
