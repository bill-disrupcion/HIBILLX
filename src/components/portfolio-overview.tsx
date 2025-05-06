// @ts-nocheck
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
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


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
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const [chartRange, setChartRange] = useState<string>('1m'); // Default to 1 month
  const [chartTicker, setChartTicker] = useState<string | null>(null); // Ticker being charted
  const [loadingChart, setLoadingChart] = useState(false);

   const formatCurrency = useCallback((value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '$--.--';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }, []);

  // Memoize portfolio calculations
   const { portfolioValue, totalInvested, totalGainLoss, totalGainLossPercent } = useMemo(() => {
    if (!positions || Object.keys(marketDataMap).length === 0) {
      return { portfolioValue: 0, totalInvested: 0, totalGainLoss: 0, totalGainLossPercent: 0 };
    }

    let currentTotalValue = 0;
    let investedTotal = 0;

    positions.forEach((position) => {
      const currentPrice = marketDataMap[position.ticker]?.price || 0;
      currentTotalValue += position.quantity * currentPrice;
      investedTotal += position.quantity * position.averagePrice;
    });

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
    if (positions && positions.length > 0) {
      // Prioritize a broad market ETF like VOO if present
      const vooPosition = positions.find(p => p.ticker === 'VOO');
      if (vooPosition) {
        setChartTicker('VOO');
      } else {
        // Otherwise, chart the largest holding by current value
        let largestTicker = positions[0].ticker;
        let largestValue = 0;
        positions.forEach(pos => {
           const value = (marketDataMap[pos.ticker]?.price || 0) * pos.quantity;
           if (value > largestValue) {
               largestValue = value;
               largestTicker = pos.ticker;
           }
        });
        setChartTicker(largestTicker);
      }
    }
  }, [positions, marketDataMap]); // Depend on positions and market data

  // Fetch initial positions and market data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPositions = await getPositions();
        setPositions(fetchedPositions);

        if (fetchedPositions.length > 0) {
             const marketDataPromises = fetchedPositions.map(p => getMarketData(p.ticker));
            const marketDataResults = await Promise.all(marketDataPromises);

            const dataMap: Record<string, MarketData> = {};
            marketDataResults.forEach(md => {
              if (md) { // Check if market data was successfully fetched
                 dataMap[md.ticker] = md;
              }
            });
            setMarketDataMap(dataMap);
        } else {
            setMarketDataMap({}); // No positions, empty map
        }

      } catch (err) {
        console.error("Failed to fetch portfolio data:", err);
        setError("Failed to load portfolio data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

   // Fetch historical chart data when ticker or range changes
   useEffect(() => {
    if (!chartTicker) return;

    const fetchChartData = async () => {
      setLoadingChart(true);
      try {
        const history = await getHistoricalData(chartTicker, chartRange);
        setChartData(history);
      } catch (err) {
        console.error(`Failed to fetch historical data for ${chartTicker}:`, err);
        // Handle error for chart specifically, maybe show a message on the chart area
        setChartData([]); // Clear previous data on error
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
  }, [chartTicker, chartRange]);


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
        <div className="flex items-center justify-between">
           <div>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Your current investment status.</CardDescription>
           </div>
            {/* Chart Range Selector */}
            <Select value={chartRange} onValueChange={setChartRange}>
              <SelectTrigger className="w-[100px]" aria-label="Select chart time range">
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
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <>
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
                            <p>Total gain/loss since inception based on average cost.</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
              </div>
            </div>

            {/* Performance Chart */}
             <div className="h-[250px] w-full relative">
                 {loadingChart && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                         <Skeleton className="h-full w-full" />
                    </div>
                 )}
                 {!loadingChart && chartData.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                        <p className="text-muted-foreground">No chart data available for {chartTicker}.</p>
                    </div>
                 )}
                 <ChartContainer config={chartConfig} className="h-full w-full">
                     <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                             // Dynamically format ticks based on range
                             tickFormatter={(value, index) => {
                                const date = new Date(value + 'T00:00:00'); // Ensure correct date parsing
                                if (chartRange === '1m') {
                                     // Show date number every 7 days approx
                                    return index % 7 === 0 ? date.toLocaleDateString('en-US', { day: 'numeric' }) : '';
                                } else if (chartRange === '6m') {
                                    // Show month abbr
                                    return date.toLocaleDateString('en-US', { month: 'short' });
                                } else { // 1y
                                    // Show month abbr every 2 months approx
                                    return index % 60 === 0 ? date.toLocaleDateString('en-US', { month: 'short' }) : '';
                                }
                             }}
                             interval={chartRange === '6m' || chartRange === '1y' ? 'preserveStartEnd' : 'equidistantPreserveStart'}
                             minTickGap={chartRange === '1m' ? 10 : 30} // Adjust gap based on density
                         />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={5}
                            domain={['dataMin - (dataMax-dataMin)*0.05', 'dataMax + (dataMax-dataMin)*0.05']}
                            tickFormatter={(value) => `$${value.toFixed(0)}`}
                            width={40}
                          />
                         <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(label) => new Date(label + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    formatter={(value) => formatCurrency(value as number)}
                                    indicator="line"
                                    labelClassName="text-sm"
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
                            type="natural"
                            fill="url(#fillValue)"
                            stroke="var(--color-value)"
                            strokeWidth={2}
                            stackId="a" // Note: stackId not really needed for single Area
                            name={chartTicker || "Value"} // Set name for tooltip
                            dot={false}
                         />
                     </AreaChart>
                 </ChartContainer>
                  {chartTicker && !loadingChart && (
                      <div className="absolute top-0 right-2 text-xs text-muted-foreground p-1 bg-background/70 rounded">
                         Charting: {chartTicker}
                      </div>
                  )}
             </div>


            {/* Positions Table */}
            <div>
              <h3 className="text-lg font-medium mb-2">Current Positions</h3>
                <div className="overflow-x-auto">
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
                                const currentPrice = currentMarketData?.price ?? 0; // Use 0 if no data
                                const totalValue = pos.quantity * currentPrice;
                                const costBasis = pos.quantity * pos.averagePrice;
                                const gainLoss = totalValue - costBasis;
                                const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

                                return (
                                    <TableRow key={pos.ticker}>
                                        <TableCell className="font-medium">{pos.ticker}</TableCell>
                                        <TableCell className="text-right">{pos.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(pos.averagePrice)}</TableCell>
                                        <TableCell className="text-right">{currentPrice > 0 ? formatCurrency(currentPrice) : '--'}</TableCell>
                                        <TableCell className="text-right">{currentPrice > 0 ? formatCurrency(totalValue) : '--'}</TableCell>
                                        <TableCell className={`text-right ${getGainLossColor(gainLoss)}`}>
                                            {currentPrice > 0 ? (
                                                <>
                                                {formatCurrency(gainLoss)}
                                                <span className="block text-xs">({gainLossPercent.toFixed(2)}%)</span>
                                                </>
                                            ) : '--'}
                                        </TableCell>
                                    </TableRow>
                                )
                             })
                        ) : (
                             <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No positions held.</TableCell>
                             </TableRow>
                         )}
                        </TableBody>
                    </Table>
                </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
