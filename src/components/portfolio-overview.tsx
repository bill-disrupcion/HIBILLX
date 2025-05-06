'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { getPositions, type Position, getMarketData, type MarketData, getHistoricalData } from '@/services/broker-api';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Added Alert


// Calculate overall portfolio historical data (more complex, requires individual asset history and weights)
// For simplicity, we'll chart a single representative asset for now, e.g., VOO if held, or the largest holding.
// Or, we could calculate total portfolio value at each historical point (requires fetching historical for all positions)

const chartConfig = {
  value: {
    label: "Value", // Changed from "Portfolio Value" as it might represent a single asset
    color: "hsl(var(--primary))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];


export default function PortfolioOverview() {
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [marketDataMap, setMarketDataMap] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // General error for positions/market data
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [chartRange, setChartRange] = useState<string>('1m'); // Default to 1 month
  const [chartTicker, setChartTicker] = useState<string | null>(null); // Ticker being charted
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null); // Specific error for chart data


   const formatCurrency = useCallback((value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$--.--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }, []);

  // Memoize portfolio calculations
   const { portfolioValue, totalInvested, totalGainLoss, totalGainLossPercent } = useMemo(() => {
    // Ensure positions and marketDataMap are not null/empty before calculating
    if (!positions || positions.length === 0 || !marketDataMap || Object.keys(marketDataMap).length === 0) {
      return { portfolioValue: 0, totalInvested: 0, totalGainLoss: 0, totalGainLossPercent: 0 };
    }

    let currentTotalValue = 0;
    let investedTotal = 0;

    positions.forEach((position) => {
      const currentPrice = marketDataMap[position.ticker]?.price;
       // Only include positions where we have a valid current price
      if (typeof currentPrice === 'number' && currentPrice >= 0) {
          currentTotalValue += position.quantity * currentPrice;
          investedTotal += position.quantity * position.averagePrice;
      } else {
         console.warn(`Missing or invalid market price for ${position.ticker} in portfolio calculation.`);
         // Optionally handle this case, e.g., by using averagePrice as a fallback or excluding it
         // For simplicity, we exclude it here if price is missing/invalid.
      }
    });

    // Avoid division by zero if totalInvested is 0 or negative (unlikely but possible)
    const gainLoss = currentTotalValue - investedTotal;
    const gainLossPercent = investedTotal > 0 ? (gainLoss / investedTotal) * 100 : 0;

    return {
      portfolioValue: currentTotalValue,
      totalInvested: investedTotal,
      totalGainLoss: gainLoss,
      totalGainLossPercent: gainLossPercent,
    };
  }, [positions, marketDataMap]);


  // Determine which ticker to chart initially
  useEffect(() => {
    // Only set chart ticker if positions and market data are loaded successfully
    if (positions && positions.length > 0 && Object.keys(marketDataMap).length > 0 && !chartTicker) {
      const vooPosition = positions.find(p => p.ticker === 'VOO');
      if (vooPosition) {
        setChartTicker('VOO');
      } else {
        let largestTicker = positions[0].ticker;
        let largestValue = -Infinity; // Use -Infinity to handle potential negative values correctly
        positions.forEach(pos => {
           const currentPrice = marketDataMap[pos.ticker]?.price;
           if (typeof currentPrice === 'number' && currentPrice >= 0) {
                const value = currentPrice * pos.quantity;
                if (value > largestValue) {
                    largestValue = value;
                    largestTicker = pos.ticker;
                }
           }
        });
         if (largestValue > -Infinity) { // Ensure we found at least one valid position
             setChartTicker(largestTicker);
         } else {
              console.warn("Could not determine largest holding for initial chart.");
         }
      }
    }
  }, [positions, marketDataMap, chartTicker]); // Added chartTicker dependency to prevent re-running if already set

  // Fetch initial positions and market data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      setMarketDataMap({}); // Clear previous data
      setPositions(null);   // Clear previous data
      try {
        const fetchedPositions = await getPositions();
        setPositions(fetchedPositions);

        if (fetchedPositions && fetchedPositions.length > 0) {
             // Fetch market data concurrently for all positions
             const marketDataPromises = fetchedPositions.map(p =>
                getMarketData(p.ticker).catch(err => {
                    console.error(`Failed to fetch market data for ${p.ticker}:`, err);
                    return null; // Return null on individual fetch error
                })
             );
            const marketDataResults = await Promise.all(marketDataPromises);

            const dataMap: Record<string, MarketData> = {};
            marketDataResults.forEach(md => {
              // Only add valid market data to the map
              if (md && md.ticker && typeof md.price === 'number') {
                 dataMap[md.ticker] = md;
              }
            });
            setMarketDataMap(dataMap);
             // Check if any market data fetch failed
             if (Object.keys(dataMap).length < fetchedPositions.length) {
                 console.warn("Some market data could not be fetched for the positions.");
                 // Optionally set a partial error state here
             }

        } else {
            setMarketDataMap({}); // No positions, empty map
            setPositions([]); // Set to empty array if no positions
        }

      } catch (err: any) {
        console.error("Failed to fetch portfolio data:", err);
        setError(`Failed to load portfolio data: ${err.message || 'Please try again later.'}`);
         setPositions([]); // Set empty array on error
         setMarketDataMap({}); // Clear map on error
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Re-fetch when component mounts

   // Fetch historical chart data when ticker or range changes
   useEffect(() => {
    if (!chartTicker) return; // Don't fetch if no ticker is selected

    const fetchChartData = async () => {
      setLoadingChart(true);
      setChartError(null); // Clear previous chart errors
      setChartData([]);    // Clear previous chart data
      try {
        const history = await getHistoricalData(chartTicker, chartRange);
        // Basic validation on fetched data
         if (!Array.isArray(history) || history.length === 0) {
             throw new Error("No historical data returned.");
         }
         // Further validation could check for date/value properties
        setChartData(history);
      } catch (err: any) {
        console.error(`Failed to fetch historical data for ${chartTicker}:`, err);
        setChartError(`Could not load chart data for ${chartTicker}: ${err.message || 'Please try again.'}`);
        setChartData([]); // Ensure data is empty on error
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
   }, [chartTicker, chartRange]); // Dependencies: ticker and range


  const renderGainLossIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
   }

   const getGainLossColor = (value: number) => {
     if (value > 0) return "text-green-500";
     if (value < 0) return "text-red-500";
     return "text-muted-foreground";
   }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
           <div>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Your current investment status.</CardDescription>
           </div>
            {/* Chart Range Selector - Disable if loading or error */}
            <Select value={chartRange} onValueChange={setChartRange} disabled={loading || !!error || loadingChart}>
              <SelectTrigger className="w-full sm:w-[100px]" aria-label="Select chart time range">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1M</SelectItem>
                <SelectItem value="6m">6M</SelectItem>
                <SelectItem value="1y">1Y</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          // Consistent Loading Skeletons
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                 <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-40" />
                 </div>
                 <div className="flex items-center space-x-1">
                     <Skeleton className="h-4 w-4" />
                     <Skeleton className="h-6 w-28" />
                     <Skeleton className="h-4 w-16" />
                 </div>
            </div>
            <Skeleton className="h-[250px] w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error ? (
           // Clear Error Display
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Portfolio</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : (
           // Main Content Display
          <>
            {/* Portfolio Summary */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
               <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold">{formatCurrency(portfolioValue)}</p>
              </div>
              <div className={`flex items-center space-x-1 ${getGainLossColor(totalGainLoss)}`}>
                 {renderGainLossIcon(totalGainLoss)}
                 <span className="font-medium text-lg">
                    {formatCurrency(totalGainLoss)}
                 </span>
                  <span className="text-sm">
                    ({totalGainLossPercent.toFixed(2)}%)
                 </span>
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Info className="h-3 w-3 text-muted-foreground cursor-help ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Total gain/loss based on average cost vs current market value.</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
              </div>
            </div>

            {/* Performance Chart Section */}
             <div className="h-[250px] w-full relative border rounded-md p-2">
                 {loadingChart ? (
                     <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                         <Skeleton className="h-full w-full" />
                          <span className="absolute text-sm text-muted-foreground">Loading chart data...</span>
                     </div>
                 ) : chartError ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 rounded-md text-center p-4">
                         <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
                        <p className="text-sm font-medium text-destructive">Chart Error</p>
                        <p className="text-xs text-destructive">{chartError}</p>
                    </div>
                 ) : chartData.length === 0 || !chartTicker ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                        <p className="text-sm text-muted-foreground p-4 text-center">
                            {chartTicker ? `No historical data available for ${chartTicker}.` : 'Select a position or ensure data is loaded to view chart.'}
                        </p>
                    </div>
                 ) : (
                     // Render Chart only if data is available
                     <>
                         <ChartContainer config={chartConfig} className="h-full w-full">
                             <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                  <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                     tickFormatter={(value, index) => {
                                        try {
                                            const date = new Date(value + 'T00:00:00Z'); // Use Z for UTC to avoid timezone issues
                                            if (isNaN(date.getTime())) return ''; // Invalid date
                                            const dayOfMonth = date.getUTCDate();

                                            if (chartRange === '1m') {
                                                return index % 7 === 0 ? dayOfMonth.toString() : ''; // Approx weekly
                                            } else if (chartRange === '6m' || chartRange === '1y') {
                                                // Show month abbr, more frequently for 6m
                                                const monthInterval = chartRange === '6m' ? 30 : 60;
                                                 // Show first tick and ticks approx every month/two months
                                                return index === 0 || index % monthInterval < (monthInterval / (chartData.length / numPoints || 1))
                                                     ? date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
                                                     : '';
                                            } else {
                                                return ''; // Default case
                                            }
                                        } catch (e) { return ''; } // Catch potential date parsing errors
                                     }}
                                     interval="preserveStartEnd"
                                     minTickGap={chartRange === '1m' ? 10 : 30}
                                 />
                                 <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={5}
                                    domain={['dataMin - (dataMax-dataMin)*0.05', 'dataMax + (dataMax-dataMin)*0.05']}
                                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                                    width={45} // Increased width slightly for better spacing
                                  />
                                 <ChartTooltip
                                    cursor={true} // Enable cursor for better interaction
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(label) => {
                                                 try {
                                                     return new Date(label + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
                                                 } catch { return label; }
                                            }}
                                            formatter={(value) => formatCurrency(value as number)}
                                            indicator="dot" // Changed indicator style
                                            labelClassName="text-sm font-semibold"
                                            nameKey="name"
                                        />
                                    }
                                 />
                                 <defs>
                                   <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8}/>
                                     <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1}/>
                                   </linearGradient>
                                 </defs>
                                 <Area
                                    dataKey="value"
                                    type="monotone" // Changed type for smoother curve
                                    fill="url(#fillValue)"
                                    stroke="var(--color-value)"
                                    strokeWidth={2}
                                    name={chartTicker || "Value"}
                                    dot={false} // Hide dots for cleaner look
                                    activeDot={{ r: 4, strokeWidth: 1, fill: 'hsl(var(--background))', stroke: 'var(--color-value)' }} // Style active dot on hover
                                 />
                             </AreaChart>
                         </ChartContainer>
                          {chartTicker && (
                              <div className="absolute top-1 right-2 text-xs text-muted-foreground p-1 bg-background/70 rounded">
                                 Charting: {chartTicker} ({chartRange.toUpperCase()})
                              </div>
                          )}
                     </>
                 )}
             </div>


            {/* Positions Table */}
            <div>
              <h3 className="text-lg font-medium mb-2">Current Positions</h3>
                <div className="overflow-x-auto border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Instrument</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Avg. Cost</TableHead>
                            <TableHead className="text-right">Current Price</TableHead>
                            <TableHead className="text-right">Market Value</TableHead>
                            <TableHead className="text-right">Total Gain/Loss</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {positions && positions.length > 0 ? (
                             positions.map((pos) => {
                                const currentMarketData = marketDataMap[pos.ticker];
                                const currentPrice = currentMarketData?.price; // Can be undefined if fetch failed
                                const hasValidPrice = typeof currentPrice === 'number' && currentPrice >= 0;

                                const totalValue = hasValidPrice ? pos.quantity * currentPrice : undefined;
                                const costBasis = pos.quantity * pos.averagePrice;
                                const gainLoss = hasValidPrice ? totalValue! - costBasis : undefined;
                                const gainLossPercent = (hasValidPrice && costBasis > 0) ? (gainLoss! / costBasis) * 100 : 0;

                                return (
                                    <TableRow key={pos.ticker} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">{pos.ticker}</TableCell>
                                        <TableCell className="text-right">{pos.quantity.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(pos.averagePrice)}</TableCell>
                                        <TableCell className="text-right">
                                             {hasValidPrice ? formatCurrency(currentPrice) : <span className="text-muted-foreground">N/A</span>}
                                         </TableCell>
                                        <TableCell className="text-right">
                                             {hasValidPrice ? formatCurrency(totalValue) : <span className="text-muted-foreground">N/A</span>}
                                        </TableCell>
                                        <TableCell className={`text-right ${hasValidPrice ? getGainLossColor(gainLoss!) : 'text-muted-foreground'}`}>
                                            {hasValidPrice ? (
                                                <>
                                                {formatCurrency(gainLoss)}
                                                <span className="block text-xs">({gainLossPercent.toFixed(2)}%)</span>
                                                </>
                                            ) : <span className="text-muted-foreground">N/A</span>}
                                        </TableCell>
                                    </TableRow>
                                )
                             })
                        ) : (
                             <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                   {positions === null ? 'Loading positions...' : 'No positions held.'}
                                </TableCell>
                             </TableRow>
                         )}
                        </TableBody>
                    </Table>
                </div>
                 {!loading && positions && positions.length > 0 && Object.keys(marketDataMap).length < positions.length && (
                    <p className="text-xs text-destructive mt-2">Note: Some market data could not be loaded. Values may be incomplete.</p>
                 )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
