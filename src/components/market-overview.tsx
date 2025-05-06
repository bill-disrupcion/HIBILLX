
'use client'; // Explicitly mark as client component

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
import { getMarketData, getTopMovers, type Instrument, type MarketData } from '@/services/broker-api'; // APIs are now real placeholders
import { TrendingUp, TrendingDown, AlertTriangle, Minus, Newspaper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IndexData extends MarketData {
  name: string;
}

interface MoversData {
  gainers: Instrument[];
  losers: Instrument[];
}

export default function MarketOverview() {
  const { toast } = useToast();
  const [indices, setIndices] = useState<IndexData[] | null>(null);
  const [movers, setMovers] = useState<MoversData | null>(null);
  const [loadingIndices, setLoadingIndices] = useState(true);
  const [loadingMovers, setLoadingMovers] = useState(true);
  const [errorIndices, setErrorIndices] = useState<string | null>(null);
  const [errorMovers, setErrorMovers] = useState<string | null>(null);

  const indexTickers = ['SPY', 'QQQ', 'DIA']; // S&P 500, Nasdaq 100, Dow Jones

  const formatCurrency = useCallback((value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '--.--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }, []);

   const formatPercent = useCallback((value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '--.--%';
    return `${value.toFixed(2)}%`;
  }, []);

  const getChangeColor = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return 'text-muted-foreground';
    if (value > 0) return 'text-green-600 dark:text-green-500';
    if (value < 0) return 'text-red-600 dark:text-red-500';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (value: number | undefined) => {
     if (value === undefined || isNaN(value)) return <Minus className="h-4 w-4 text-muted-foreground" />;
     if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />;
     if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />;
     return <Minus className="h-4 w-4 text-muted-foreground" />;
   };


  // Fetch Index Data - Attempts real API calls via getMarketData
  useEffect(() => {
    const fetchIndices = async () => {
      setLoadingIndices(true);
      setErrorIndices(null);
      try {
        const indexDataPromises = indexTickers.map(async (ticker) => {
          // getMarketData will throw if not implemented/configured
          const data = await getMarketData(ticker);
          const nameMap: Record<string, string> = { 'SPY': 'S&P 500 ETF', 'QQQ': 'Nasdaq 100 ETF', 'DIA': 'Dow Jones ETF' };
          return { ...data, name: nameMap[ticker] || ticker };
        });

        // Use Promise.allSettled to handle potential individual failures
        const results = await Promise.allSettled(indexDataPromises);

        const fetchedIndices: IndexData[] = [];
        const errors: string[] = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                fetchedIndices.push(result.value);
            } else {
                console.error(`Failed to fetch index data for ${indexTickers[index]}:`, result.reason);
                errors.push(`Failed for ${indexTickers[index]}: ${result.reason?.message || 'Unknown error'}`);
            }
        });

        setIndices(fetchedIndices);

        if (errors.length > 0) {
             // Show first error, or a generic message if all failed
             const errorMsg = fetchedIndices.length > 0
                 ? `Could not load data for some indices (${errors.length} failed). ${errors[0]}`
                 : `Failed to load all index data. ${errors[0]}`;
             setErrorIndices(errorMsg);
        }

      } catch (err: any) { // Catch errors from Promise.allSettled or initial setup
        console.error("General error fetching index data:", err);
        setErrorIndices(err.message || 'An unexpected error occurred while loading index data.');
        setIndices(null);
      } finally {
        setLoadingIndices(false);
      }
    };
    fetchIndices();
  }, []); // Runs once on mount

  // Fetch Movers Data - Attempts real API calls via getTopMovers
  useEffect(() => {
    const fetchMovers = async () => {
      setLoadingMovers(true);
      setErrorMovers(null);
      try {
        // getTopMovers will throw if not implemented/configured
        const fetchedMovers = await getTopMovers(5);
        setMovers(fetchedMovers);
      } catch (err: any) {
        console.error("Failed to fetch market movers:", err);
        setErrorMovers(`Failed to load market movers: ${err.message || 'Check API implementation.'}`);
        setMovers(null);
      } finally {
        setLoadingMovers(false);
      }
    };
    fetchMovers();
  }, []); // Runs once on mount

  const handleItemClick = useCallback((ticker: string, name: string) => {
    console.log(`Clicked on ${name} (${ticker})`);
    toast({
        title: `Viewing ${name} (${ticker})`,
        description: "Detailed view/chart functionality requires implementation.",
    });
    // Example: router.push(`/market/${ticker}`);
  }, [toast]);


  const renderIndexCard = (index: IndexData) => (
     <div
         key={index.ticker}
         className="flex flex-col p-3 border rounded-md bg-card shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-150 cursor-pointer"
         onClick={() => handleItemClick(index.ticker, index.name)}
         tabIndex={0}
         onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleItemClick(index.ticker, index.name)}
         role="button"
         aria-label={`View details for ${index.name} (${index.ticker})`}
     >
         <span className="text-xs font-medium text-muted-foreground">{index.name} ({index.ticker})</span>
         <span className="text-lg font-semibold mt-1">{formatCurrency(index.price)}</span>
         <div className={`flex items-center text-sm mt-0.5 ${getChangeColor(index.changePercent)}`}>
              {getChangeIcon(index.changePercent)}
              <span className="ml-1 font-medium">{formatPercent(index.changePercent)}</span>
              <span className="ml-1 text-xs">({formatCurrency(index.changeValue)})</span>
         </div>
     </div>
  );

  const renderMoversTable = (data: Instrument[] | undefined, title: string) => (
      <div>
          <h4 className="text-md font-semibold mb-2">{title}</h4>
           {loadingMovers ? (
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
           ) : errorMovers && title === 'Top Gainers' ? ( // Show error only once
               <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Movers Error</AlertTitle>
                  <AlertDescription>{errorMovers}</AlertDescription>
               </Alert>
           ) : !data || data.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No {title.toLowerCase()} data available{errorMovers ? ' (API error)' : '.'}</p>
           ) : (
              <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="p-1.5">Ticker</TableHead>
                      <TableHead className="text-right p-1.5">Price</TableHead>
                      <TableHead className="text-right p-1.5">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {data.map((mover) => (
                          <TableRow
                              key={mover.ticker}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleItemClick(mover.ticker, mover.name)}
                              tabIndex={0}
                              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleItemClick(mover.ticker, mover.name)}
                              role="button"
                              aria-label={`View details for ${mover.name} (${mover.ticker})`}
                          >
                              <TableCell className="font-medium p-1.5">{mover.ticker}</TableCell>
                              <TableCell className="text-right p-1.5">{formatCurrency(mover.price)}</TableCell>
                              <TableCell className={`text-right p-1.5 font-medium ${getChangeColor(mover.changePercent)}`}>
                                  {formatPercent(mover.changePercent)}
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
           <Newspaper className="mr-2 h-5 w-5 text-primary" /> Market Overview
        </CardTitle>
        <CardDescription>Live market trends and top movers. Requires API setup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Major Indices */}
        <div>
           <h3 className="text-lg font-semibold mb-3">Major Indices</h3>
            {loadingIndices ? (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="flex flex-col p-3 border rounded-md bg-muted/30 space-y-1.5">
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    ))}
                 </div>
            ) : errorIndices ? (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Indices Error</AlertTitle>
                    <AlertDescription>{errorIndices}</AlertDescription>
                 </Alert>
            ) : indices && indices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {indices.map(renderIndexCard)}
                </div>
            ) : !errorIndices ? ( // Only show this if there wasn't an error but no data
                <p className="text-sm text-muted-foreground italic">Index data unavailable.</p>
            ) : null /* Error is already displayed */}
        </div>

        {/* Top Movers */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
             {renderMoversTable(movers?.gainers, 'Top Gainers')}
             {renderMoversTable(movers?.losers, 'Top Losers')}
         </div>

      </CardContent>
    </Card>
  );
}
