
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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart, Bar } from "recharts" // Import Line, ComposedChart, Bar
import { getPositions, type Position, getMarketData, type MarketData, getHistoricalData, AssetType } from '@/services/broker-api';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle, LineChart as LineChartIcon, DollarSign, Landmark } from 'lucide-react'; // Use relevant icons
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


const chartConfig = {
  value: { label: "Value/Yield", color: "hsl(var(--primary))" },
  price: { label: "Price", color: "hsl(var(--chart-1))" }, // Added for price line
  yield: { label: "Yield (%)", color: "hsl(var(--chart-2))" }, // Added for yield line
} satisfies React.ComponentProps<typeof ChartContainer>["config"];


export default function PortfolioOverview() {
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [marketDataMap, setMarketDataMap] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{ date: string; value: number; price?: number; yield?: number }[]>([]); // Include optional price/yield
  const [chartRange, setChartRange] = useState<string>('1m');
  const [chartTicker, setChartTicker] = useState<string | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [partialDataWarning, setPartialDataWarning] = useState<string | null>(null);


   const formatCurrency = useCallback((value: number | undefined, compact = false) => {
    if (value === undefined || isNaN(value)) return '$--.--';
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        notation: compact ? 'compact' : 'standard',
        maximumFractionDigits: compact ? 1 : 2,
        minimumFractionDigits: compact ? 1 : 2,
    }).format(value);
  }, []);

  const formatPercent = useCallback((value: number | undefined, decimals: number = 2) => {
    if (value === undefined || isNaN(value)) return '--.--%';
    return `${value.toFixed(decimals)}%`;
  }, []);


  // Memoize portfolio calculations, considering potential bond yields vs prices
   const { portfolioValue, totalInvested, totalGainLoss, totalGainLossPercent } = useMemo(() => {
    if (!positions || positions.length === 0) {
      return { portfolioValue: 0, totalInvested: 0, totalGainLoss: 0, totalGainLossPercent: 0 };
    }

    let currentTotalValue = 0;
    let investedTotal = 0; // Based on average acquisition price

    positions.forEach((position) => {
      const currentMarketData = marketDataMap[position.ticker];
      const currentPrice = currentMarketData?.price; // This might be yield for some indices, but use market_value from broker if available
      const marketValueFromBroker = position.market_value; // Use broker's calculation if provided

      if (typeof marketValueFromBroker === 'number') {
          currentTotalValue += marketValueFromBroker;
      } else if (typeof currentPrice === 'number' && currentPrice >= 0 && position.asset_type !== AssetType.OTHER) { // Use price only if not a yield index
          currentTotalValue += position.quantity * currentPrice;
      } else {
         console.warn(`Missing or invalid market value/price for ${position.ticker} in portfolio calculation.`);
      }

       // Cost basis calculation remains based on average acquisition price
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


  // Determine which ticker to chart initially (prioritize major bond ETF or largest holding)
  useEffect(() => {
    if (positions && positions.length > 0 && Object.keys(marketDataMap).length > 0 && !chartTicker && !error) {
      const primaryBondEtf = positions.find(p => p.ticker === 'AGG' || p.ticker === 'BND' || p.ticker === 'GOVT');
      if (primaryBondEtf) {
        setChartTicker(primaryBondEtf.ticker);
      } else {
        // Fallback to largest holding by market value
        let largestTicker = null;
        let largestValue = -Infinity;
        positions.forEach(pos => {
           const value = pos.market_value ?? (marketDataMap[pos.ticker]?.price ? marketDataMap[pos.ticker]!.price * pos.quantity : -Infinity);
            if (value > largestValue) {
                largestValue = value;
                largestTicker = pos.ticker;
            }
        });
         if (largestTicker) {
             setChartTicker(largestTicker);
         }
      }
    } else if (error && !loading) {
        setChartTicker(null);
    }
  }, [positions, marketDataMap, chartTicker, error, loading]);

  // Fetch initial positions and market data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      setPartialDataWarning(null);
      setMarketDataMap({});
      setPositions(null);
      try {
        // Fetch positions (assuming broker provides market_value, current_price, etc.)
        const fetchedPositions = await getPositions();
        setPositions(fetchedPositions);

        if (fetchedPositions && fetchedPositions.length > 0) {
             let successfulMarketDataFetches = 0;
             const neededTickers = fetchedPositions
                .filter(p => p.current_price === undefined || p.yield_value === undefined) // Only fetch if broker didn't provide
                .map(p => p.ticker);

             const marketDataPromises = neededTickers.map(ticker =>
                getMarketData(ticker)
                    .then(data => ({ ticker, data }))
                    .catch(err => {
                        console.error(`Failed to fetch market data for ${ticker}:`, err);
                        return { ticker, data: null }; // Return null on individual fetch error
                    })
             );
            const marketDataResults = await Promise.all(marketDataPromises);

            const dataMap: Record<string, MarketData> = {};
            marketDataResults.forEach(result => {
              if (result.data) {
                 dataMap[result.ticker] = result.data;
                 successfulMarketDataFetches++;
              }
            });
            // Merge broker-provided data with fetched data (fetched takes precedence if newer?)
            const initialMap: Record<string, MarketData> = {};
             fetchedPositions.forEach(pos => {
                 if (pos.current_price !== undefined) {
                     initialMap[pos.ticker] = { // Create MarketData from Position data
                         ticker: pos.ticker,
                         price: pos.current_price, // Might be yield if broker structures it that way
                         timestamp: new Date(), // Use current time as broker data is usually near real-time
                         yield_value: pos.yield_value,
                         duration: pos.duration,
                         // Add other fields if available from position
                     };
                 }
             });

            setMarketDataMap({ ...initialMap, ...dataMap }); // Fetched data overwrites initial if keys match

             if (neededTickers.length > 0 && successfulMarketDataFetches < neededTickers.length) {
                 const failedCount = neededTickers.length - successfulMarketDataFetches;
                 setPartialDataWarning(`Could not load market data for ${failedCount} position(s). Portfolio value may be incomplete.`);
             }

        } else {
            setMarketDataMap({});
            setPositions([]);
        }

      } catch (err: any) {
        console.error("Failed to fetch portfolio data:", err);
        setError(`Failed to load portfolio data: ${err.message || 'Check API/backend.'}`);
         setPositions([]);
         setMarketDataMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

   // Fetch historical chart data when ticker or range changes
   useEffect(() => {
    if (!chartTicker || error) return;

    const fetchChartData = async () => {
      setLoadingChart(true);
      setChartError(null);
      setChartData([]);
      try {
        console.log(`Fetching chart data for: ${chartTicker}, range: ${chartRange}`);
        // Fetch historical data (this typically returns closing price/value)
        const history = await getHistoricalData(chartTicker, chartRange);
         if (!Array.isArray(history) || history.length === 0) {
             throw new Error("No historical data returned.");
         }
         // Assuming 'value' from getHistoricalData is the closing price/index value
         // We can rename it to 'price' for clarity in the chart
         const formattedHistory = history.map(item => ({
             date: item.date,
             value: item.value, // Keep 'value' for Area chart consistency? Or use price/yield?
             price: item.value, // Map historical value to price
             // TODO: Fetch historical yield data if available and needed for the chart
             // This might require a separate API call or a different endpoint
         }));
        setChartData(formattedHistory);
      } catch (err: any) {
        console.error(`Failed to fetch historical data for ${chartTicker}:`, err);
        setChartError(`Could not load chart data for ${chartTicker}: ${err.message || 'Check API.'}`);
        setChartData([]);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
   }, [chartTicker, chartRange, error]);


  const renderGainLossIcon = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
   }

   const getGainLossColor = (value: number | undefined) => {
     if (value === undefined || isNaN(value)) return "text-muted-foreground";
     if (value > 0) return "text-green-600 dark:text-green-500";
     if (value < 0) return "text-red-600 dark:text-red-500";
     return "text-muted-foreground";
   }

   const shouldShowAlert = error || partialDataWarning;
   const alertVariant = error ? "destructive" : "warning";
   const alertTitle = error ? "Error Loading Portfolio" : "Partial Data Loaded";
   const alertDescription = error || partialDataWarning;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
           <div>
              <CardTitle>Institutional Portfolio Overview</CardTitle>
              <CardDescription>Current holdings and performance. Requires Broker API setup.</CardDescription>
           </div>
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
          <div className="space-y-6"> <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0"> <div className="space-y-1"> <Skeleton className="h-4 w-24" /> <Skeleton className="h-9 w-48" /> </div> <div className="flex items-center space-x-1"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-6 w-32" /> <Skeleton className="h-4 w-20" /> </div> </div> <Skeleton className="h-[250px] w-full" /> <Skeleton className="h-40 w-full" /> </div>
        ) : shouldShowAlert ? (
            <Alert variant={alertVariant}> <AlertTriangle className="h-4 w-4" /> <AlertTitle>{alertTitle}</AlertTitle> <AlertDescription>{alertDescription}</AlertDescription> </Alert>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
               <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <p className="text-3xl font-bold">{formatCurrency(portfolioValue)}</p>
                 {partialDataWarning && <p className="text-xs text-yellow-600 dark:text-yellow-400">(Based on available data)</p>}
              </div>
              <div className={`flex items-center space-x-1 ${getGainLossColor(totalGainLoss)}`}>
                 {renderGainLossIcon(totalGainLoss)}
                 <span className="font-medium text-lg">
                    {formatCurrency(totalGainLoss)}
                 </span>
                  <span className="text-sm">
                    ({formatPercent(totalGainLossPercent)})
                 </span>
                  <TooltipProvider> <Tooltip> <TooltipTrigger asChild> <Info className="h-3 w-3 text-muted-foreground cursor-help ml-1" /> </TooltipTrigger> <TooltipContent> <p>Total unrealized gain/loss based on average cost vs current market value.</p> {partialDataWarning && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">May be incomplete.</p>} </TooltipContent> </Tooltip> </TooltipProvider>
              </div>
            </div>

            {/* Performance Chart Section */}
             <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center">
                   <LineChartIcon className="mr-2 h-5 w-5 text-primary"/> Performance: {chartTicker || 'Select Holding'}
                </h3>
                <div className="h-[250px] w-full relative border rounded-md p-2">
                    {loadingChart ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md"> <Skeleton className="h-full w-full" /> <span className="absolute text-sm text-muted-foreground">Loading chart data...</span> </div>
                    ) : chartError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 rounded-md text-center p-4"> <AlertTriangle className="h-6 w-6 text-destructive mb-2" /> <p className="text-sm font-medium text-destructive">Chart Error</p> <p className="text-xs text-destructive">{chartError}</p> </div>
                    ) : chartData.length === 0 || !chartTicker ? (
                         <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md"> <p className="text-sm text-muted-foreground p-4 text-center"> {chartTicker ? `No historical data available for ${chartTicker}.` : 'Select a holding from the table below to view its chart.'} </p> </div>
                    ) : (
                        <>
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                {/* Using ComposedChart to potentially show price and yield */}
                                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                     <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => { try { const date = new Date(value + 'T00:00:00Z'); if (isNaN(date.getTime())) return ''; const numPoints = chartData.length; if (chartRange === '1m') { const wi = Math.max(1, Math.floor(numPoints / 4)); return wi > 0 && (index === 0 || index === numPoints - 1 || index % wi === 0) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : ''; } else if (chartRange === '6m') { const mi = Math.max(1, Math.floor(numPoints / 6)); return mi > 0 && (index === 0 || index === numPoints - 1 || index % mi === 0) ? date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) : ''; } else if (chartRange === '1y') { const qi = Math.max(1, Math.floor(numPoints / 4)); return qi > 0 && (index === 0 || index === numPoints - 1 || index % qi === 0) ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }) : ''; } else { return ''; } } catch (e) { return ''; } }} interval="preserveStartEnd" minTickGap={chartRange === '1m' ? 5 : 15} />
                                    {/* Left Y-axis for Price */}
                                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={5} domain={['dataMin - (dataMax-dataMin)*0.05', 'dataMax + (dataMax-dataMin)*0.05']} tickFormatter={(value) => formatCurrency(value)} width={55} />
                                     {/* Right Y-axis for Yield (optional) */}
                                     {chartData.some(d => d.yield !== undefined) && (
                                         <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={5} domain={['auto', 'auto']} tickFormatter={(value) => formatPercent(value)} width={45} />
                                     )}
                                    <ChartTooltip cursor={true} content={ <ChartTooltipContent labelFormatter={(label) => { try { return new Date(label + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); } catch { return label; } }} formatter={(value, name) => name === 'price' ? formatCurrency(value as number) : name === 'yield' ? formatPercent(value as number) : value} indicator="dot" labelClassName="text-sm font-semibold" /> } />
                                    {/* Price Line */}
                                     <Line yAxisId="left" dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} name="Price" dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
                                     {/* Yield Line (optional) */}
                                     {chartData.some(d => d.yield !== undefined) && (
                                         <Line yAxisId="right" dataKey="yield" type="monotone" stroke="var(--color-yield)" strokeWidth={2} name="Yield" dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
                                     )}
                                </ComposedChart>
                            </ChartContainer>
                             {chartTicker && ( <div className="absolute top-1 right-2 text-xs text-muted-foreground p-1 bg-background/70 rounded"> Charting: {chartTicker} ({chartRange.toUpperCase()}) </div> )}
                        </>
                    )}
                </div>
             </div>


            {/* Positions Table */}
            <div>
              <h3 className="text-lg font-medium mb-2">Current Holdings</h3>
                <div className="overflow-x-auto border rounded-md">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Instrument</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Quantity/Face</TableHead>
                            <TableHead className="text-right">Avg. Cost</TableHead>
                            <TableHead className="text-right">Current Price/Yield</TableHead>
                            <TableHead className="text-right">Market Value</TableHead>
                            <TableHead className="text-right">Unrealized P/L</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {positions && positions.length > 0 ? (
                             positions.map((pos) => {
                                const currentMarketData = marketDataMap[pos.ticker];
                                // Prefer broker's current price if available, else use fetched data
                                const currentPriceOrYield = pos.current_price ?? currentMarketData?.price;
                                const currentYield = pos.yield_value ?? currentMarketData?.yield_value; // Prefer broker yield if available
                                const marketValue = pos.market_value ?? (currentPriceOrYield !== undefined ? pos.quantity * currentPriceOrYield : undefined);
                                const gainLoss = pos.unrealized_pnl ?? (marketValue !== undefined ? marketValue - (pos.quantity * pos.averagePrice) : undefined);
                                const gainLossPercent = (gainLoss !== undefined && (pos.quantity * pos.averagePrice) > 0) ? (gainLoss / (pos.quantity * pos.averagePrice)) * 100 : 0;
                                const isSelected = pos.ticker === chartTicker;
                                const hasChartData = marketDataMap[pos.ticker] !== undefined || pos.current_price !== undefined; // Check if we have any price data for charting

                                // Format Quantity based on type (e.g., face value for bonds)
                                const formattedQuantity = pos.asset_type === AssetType.SOVEREIGN_BOND || pos.asset_type === AssetType.TREASURY_BILL
                                     ? formatCurrency(pos.quantity, true) // Compact format for large face values
                                     : pos.quantity.toLocaleString();

                                // Display price or yield based on asset type
                                const displayPriceOrYield = pos.asset_type === AssetType.OTHER // Assuming OTHER are yield indices for now
                                    ? formatPercent(currentPriceOrYield)
                                    : formatCurrency(currentPriceOrYield);

                                return (
                                    <TableRow
                                        key={pos.ticker}
                                        className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-primary/10 hover:bg-primary/15' : ''} ${!hasChartData ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        onClick={() => hasChartData && setChartTicker(pos.ticker)}
                                        tabIndex={0}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && hasChartData && setChartTicker(pos.ticker)}
                                        aria-disabled={!hasChartData}
                                        title={!hasChartData ? "Chart data unavailable" : `View chart for ${pos.ticker}`}
                                    >
                                        <TableCell className={`font-medium flex items-center gap-1.5 ${isSelected ? 'text-primary' : ''}`}>
                                             {pos.asset_type === AssetType.SOVEREIGN_BOND || pos.asset_type === AssetType.TREASURY_BILL ? <Landmark className="h-3 w-3 text-muted-foreground"/> : <DollarSign className="h-3 w-3 text-muted-foreground"/>}
                                             {pos.ticker}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground capitalize">{(pos.asset_type || 'N/A').replace('_', ' ')}</TableCell>
                                        <TableCell className="text-right">{formattedQuantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(pos.averagePrice)}</TableCell>
                                        <TableCell className="text-right">
                                             {currentPriceOrYield !== undefined ? displayPriceOrYield : <span className="text-xs text-destructive italic">N/A</span>}
                                             {/* Optionally show yield if price is shown */}
                                             {currentYield !== undefined && pos.asset_type !== AssetType.OTHER && <span className="block text-xs text-muted-foreground">({formatPercent(currentYield)})</span>}
                                         </TableCell>
                                        <TableCell className="text-right font-medium">
                                             {marketValue !== undefined ? formatCurrency(marketValue) : <span className="text-xs text-destructive italic">N/A</span>}
                                        </TableCell>
                                        <TableCell className={`text-right ${getGainLossColor(gainLoss)}`}>
                                            {gainLoss !== undefined ? ( <> {formatCurrency(gainLoss)} <span className="block text-xs">({formatPercent(gainLossPercent)})</span> </> ) : <span className="text-xs text-destructive italic">N/A</span>}
                                        </TableCell>
                                    </TableRow>
                                )
                             })
                        ) : (
                             <TableRow> <TableCell colSpan={7} className="text-center text-muted-foreground h-24"> {positions === null ? 'Loading holdings...' : 'No holdings found.'} </TableCell> </TableRow>
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
