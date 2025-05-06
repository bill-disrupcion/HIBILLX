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
import { getMarketData, getTopMovers, type Instrument, type MarketData } from '@/services/broker-api';
import { TrendingUp, TrendingDown, AlertTriangle, Minus } from 'lucide-react';

interface IndexData extends MarketData {
  name: string;
}

interface MoversData {
  gainers: Instrument[];
  losers: Instrument[];
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[] | null>(null);
  const [movers, setMovers] = useState<MoversData | null>(null);
  const [loadingIndices, setLoadingIndices] = useState(true);
  const [loadingMovers, setLoadingMovers] = useState(true);
  const [errorIndices, setErrorIndices] = useState<string | null>(null);
  const [errorMovers, setErrorMovers] = useState<string | null>(null);

  const indexTickers = ['SPY', 'QQQ', 'DIA']; // S&P 500, Nasdaq 100, Dow Jones

  const formatCurrency = useCallback((value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '--.--';
    // Basic formatting, consider Intl.NumberFormat for better localization
    return value.toFixed(2);
  }, []);

   const formatPercent = useCallback((value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '--.--%';
    return `${value.toFixed(2)}%`;
  }, []);

  const getChangeColor = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return 'text-muted-foreground';
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (value: number | undefined) => {
     if (value === undefined || isNaN(value)) return <Minus className="h-4 w-4 text-muted-foreground" />;
     if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
     if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
     return <Minus className="h-4 w-4 text-muted-foreground" />;
   };


  // Fetch Index Data
  useEffect(() => {
    const fetchIndices = async () => {
      setLoadingIndices(true);
      setErrorIndices(null);
      try {
        const indexDataPromises = indexTickers.map(async (ticker) => {
          const data = await getMarketData(ticker);
          // You might need a mapping from ticker to full name
          const nameMap: Record<string, string> = {
            'SPY': 'S&P 500 ETF',
            'QQQ': 'Nasdaq 100 ETF',
            'DIA': 'Dow Jones ETF'
          };
          return { ...data, name: nameMap[ticker] || ticker };
        });
        const fetchedIndices = await Promise.all(indexDataPromises);
        setIndices(fetchedIndices);
      } catch (err: any) {
        console.error("Failed to fetch index data:", err);
        setErrorIndices(`Failed to load index data: ${err.message || 'Please try again.'}`);
        setIndices(null);
      } finally {
        setLoadingIndices(false);
      }
    };
    fetchIndices();
  }, []); // Runs once on mount

  // Fetch Movers Data
  useEffect(() => {
    const fetchMovers = async () => {
      setLoadingMovers(true);
      setErrorMovers(null);
      try {
        const fetchedMovers = await getTopMovers(5); // Fetch top 5 gainers/losers
        setMovers(fetchedMovers);
      } catch (err: any) {
        console.error("Failed to fetch market movers:", err);
        setErrorMovers(`Failed to load market movers: ${err.message || 'Please try again.'}`);
        setMovers(null);
      } finally {
        setLoadingMovers(false);
      }
    };
    fetchMovers();
  }, []); // Runs once on mount

  const renderIndexCard = (index: IndexData) => (
     <div key={index.ticker} className="flex flex-col p-3 border rounded-md bg-muted/30">
         <span className="text-xs text-muted-foreground">{index.name} ({index.ticker})</span>
         <span className="text-lg font-semibold">{formatCurrency(index.price)}</span>
         <div className={`flex items-center text-sm ${getChangeColor(index.changePercent)}`}>
              {getChangeIcon(index.changePercent)}
              <span className="ml-1">{formatPercent(index.changePercent)}</span>
              <span className="ml-1">({formatCurrency(index.changeValue)})</span>
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
           ) : errorMovers && title === 'Top Gainers' ? ( // Only show error once
               <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Movers Error</AlertTitle>
                  <AlertDescription>{errorMovers}</AlertDescription>
               </Alert>
           ) : !data || data.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No {title.toLowerCase()} data available.</p>
           ) : (
              <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="p-1">Ticker</TableHead>
                      <TableHead className="text-right p-1">Price</TableHead>
                      <TableHead className="text-right p-1">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {data.map((mover) => (
                          <TableRow key={mover.ticker}>
                              <TableCell className="font-medium p-1">{mover.ticker}</TableCell>
                              <TableCell className="text-right p-1">{formatCurrency(mover.price)}</TableCell>
                              <TableCell className={`text-right p-1 font-medium ${getChangeColor(mover.changePercent)}`}>
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
          <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Market Overview
        </CardTitle>
        <CardDescription>Live market trends and top movers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Major Indices */}
        <div>
           <h3 className="text-lg font-semibold mb-3">Major Indices</h3>
            {loadingIndices ? (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="flex flex-col p-3 border rounded-md bg-muted/30 space-y-1">
                            <Skeleton className="h-3 w-20" />
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
            ) : (
                <p className="text-sm text-muted-foreground italic">Index data unavailable.</p>
            )}
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
