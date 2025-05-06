'use client';

import React, { useState, useEffect } from 'react';
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
import { getPositions, type Position, getMarketData, type MarketData } from '@/services/broker-api';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';


const chartDataPlaceholder = [
  { date: "2024-01", value: 10000 },
  { date: "2024-02", value: 10500 },
  { date: "2024-03", value: 10200 },
  { date: "2024-04", value: 11000 },
  { date: "2024-05", value: 11500 },
  { date: "2024-06", value: 12000 },
];

const chartConfig = {
  value: {
    label: "Portfolio Value",
    color: "hsl(var(--primary))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];


export default function PortfolioOverview() {
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [marketDataMap, setMarketDataMap] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPositions = await getPositions();
        setPositions(fetchedPositions);

        const marketDataPromises = fetchedPositions.map(p => getMarketData(p.ticker));
        const marketDataResults = await Promise.all(marketDataPromises);

        const dataMap: Record<string, MarketData> = {};
        marketDataResults.forEach(md => {
          dataMap[md.ticker] = md;
        });
        setMarketDataMap(dataMap);

      } catch (err) {
        console.error("Failed to fetch portfolio data:", err);
        setError("Failed to load portfolio data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePortfolioValue = () => {
    if (!positions || Object.keys(marketDataMap).length === 0) return 0;
    return positions.reduce((total, position) => {
      const currentPrice = marketDataMap[position.ticker]?.price || 0;
      return total + position.quantity * currentPrice;
    }, 0);
  };

   const calculateTotalInvested = () => {
    if (!positions) return 0;
    return positions.reduce((total, position) => {
        return total + position.quantity * position.averagePrice;
    }, 0);
   }

  const portfolioValue = calculatePortfolioValue();
  const totalInvested = calculateTotalInvested();
  const totalGainLoss = portfolioValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

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
        <CardTitle>Portfolio Overview</CardTitle>
        <CardDescription>Your current investment status.</CardDescription>
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
              <div className={`flex items-center space-x-2 ${getGainLossColor(totalGainLoss)}`}>
                 {renderGainLossIcon(totalGainLoss)}
                 <span className="font-medium">
                    {formatCurrency(totalGainLoss)} ({totalGainLossPercent.toFixed(2)}%)
                 </span>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="h-[250px] w-full">
               <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={chartDataPlaceholder} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                         <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.substring(5)} // Show month only for brevity
                        />
                        <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
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
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </div>


            {/* Positions Table */}
            <div>
              <h3 className="text-lg font-medium mb-2">Current Positions</h3>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Instrument</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Avg. Price</TableHead>
                        <TableHead className="text-right">Current Price</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead className="text-right">Gain/Loss</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {positions && positions.length > 0 ? (
                         positions.map((pos) => {
                            const currentMarketData = marketDataMap[pos.ticker];
                            const currentPrice = currentMarketData?.price ?? 0;
                            const totalValue = pos.quantity * currentPrice;
                            const gainLoss = (currentPrice - pos.averagePrice) * pos.quantity;
                            const gainLossPercent = pos.averagePrice > 0 ? ((currentPrice - pos.averagePrice) / pos.averagePrice) * 100 : 0;

                            return (
                                <TableRow key={pos.ticker}>
                                    <TableCell className="font-medium">{pos.ticker}</TableCell>
                                    <TableCell className="text-right">{pos.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(pos.averagePrice)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(currentPrice)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(totalValue)}</TableCell>
                                    <TableCell className={`text-right ${getGainLossColor(gainLoss)}`}>
                                        {formatCurrency(gainLoss)} ({gainLossPercent.toFixed(2)}%)
                                    </TableCell>
                                </TableRow>
                            )
                         })
                    ) : (
                         <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">No positions held.</TableCell>
                         </TableRow>
                     )}
                    </TableBody>
                </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
