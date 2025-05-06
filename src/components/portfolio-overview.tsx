

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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart, Bar } from "recharts"
import { getPositions, type Position, getMarketData, type MarketData, getHistoricalData, AssetType, ApiError, DataProviderError, ValidationError, BrokerConnectionError, AuthorizationError } from '@/services/broker-api'; // Import error types
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle, LineChart as LineChartIcon, DollarSign, Landmark } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from '@/hooks/use-toast'; // Import useToast


const chartConfig = {
  value: { label: "Value/Yield", color: "hsl(var(--primary))" },
  price: { label: "Price", color: "hsl(var(--chart-1))" },
  yield: { label: "Yield (%)", color: "hsl(var(--chart-2))" },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];


export default function PortfolioOverview() {
  const { toast } = useToast(); // Initialize toast
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [marketDataMap, setMarketDataMap] = useState<Record<string, MarketData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Overall portfolio loading error
  const [chartData, setChartData] = useState<{ date: string; value: number; price?: number; yield?: number }[]>([]);
  const [chartRange, setChartRange] = useState<string>('1m');
  const [chartTicker, setChartTicker] = useState<string | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null); // Chart specific error
  const [partialDataWarning, setPartialDataWarning] = useState<string | null>(null); // Warning for incomplete market data


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


  // Memoize portfolio calculations, safely handling missing data
   const { portfolioValue, totalInvested, totalGainLoss, totalGainLossPercent } = useMemo(() => {
    if (!positions || positions.length === 0) {
      return { portfolioValue: 0, totalInvested: 0, totalGainLoss: 0, totalGainLossPercent: 0 };
    }

    let currentTotalValue = 0;
    let investedTotal = 0;
    let valueCalculationPossible = true; // Flag to track if calculation is reliable

    positions.forEach((position) => {
      // Calculate cost basis
      investedTotal += position.quantity * position.averagePrice;

      // Calculate current value (prefer broker's value, fallback to fetched)
      const currentMarketData = marketDataMap[position.ticker];
      let positionValue: number | undefined = position.market_value; // Prefer broker's market value

      if (positionValue === undefined) {
          const currentPrice = position.current_price ?? currentMarketData?.price;
          if (typeof currentPrice === 'number' && currentPrice >= 0 && position.asset_type !== AssetType.OTHER) {
              positionValue = position.quantity * currentPrice;
          }
      }

      if (typeof positionValue === 'number') {
          currentTotalValue += positionValue;
      } else {
         console.warn(`Missing or invalid market value/price for ${position.ticker} in portfolio calculation.`);
         // If *any* position value is missing, the total is unreliable
         valueCalculationPossible = false;
      }
    });

    // If total value calculation was compromised, return zeros or indicate unreliability
    if (!valueCalculationPossible) {
        console.warn("Portfolio value calculation is incomplete due to missing market data.");
         // Optionally, set a state here to show a specific warning in the UI for the total value
         // return { portfolioValue: 0, totalInvested: investedTotal, totalGainLoss: 0, totalGainLossPercent: 0 };
         // Or return calculated value but understand it's partial
    }

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
    if (positions && positions.length > 0 && Object.keys(marketDataMap).length > 0 && !chartTicker && !error) {
      const primaryBondEtf = positions.find(p => ['AGG', 'BND', 'GOVT'].includes(p.ticker));
      if (primaryBondEtf) {
        setChartTicker(primaryBondEtf.ticker);
      } else {
        let largestTicker: string | null = null;
        let largestValue = -Infinity;
        positions.forEach(pos => {
           const value = pos.market_value ?? (marketDataMap[pos.ticker]?.price ? marketDataMap[pos.ticker]!.price * pos.quantity : -Infinity);
            if (typeof value === 'number' && value > largestValue) {
                largestValue = value;
                largestTicker = pos.ticker;
            }
        });
         if (largestTicker) {
             setChartTicker(largestTicker);
         } else if (positions.length > 0) {
            // Fallback to the first position if no value calculation was possible
             setChartTicker(positions[0].ticker);
         }
      }
    } else if (error && !loading) {
        setChartTicker(null); // Don't select a ticker if initial load failed
    }
  }, [positions, marketDataMap, chartTicker, error, loading]);

  // Fetch initial positions and market data with error handling
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      setPartialDataWarning(null);
      setMarketDataMap({});
      setPositions(null);
      try {
        // Fetch positions
        const fetchedPositions = await getPositions(); // This can throw BrokerConnectionError, AuthorizationError, ApiError
        setPositions(fetchedPositions);

        if (fetchedPositions && fetchedPositions.length > 0) {
             let successfulMarketDataFetches = 0;
             // Identify tickers needing market data fetch (if not provided by broker)
             const tickersToFetch = fetchedPositions
                .filter(p => p.current_price === undefined && p.market_value === undefined && p.asset_type !== AssetType.OTHER) // Only fetch for non-yield assets without broker values
                .map(p => p.ticker);

             const marketDataPromises = tickersToFetch.map(ticker =>
                getMarketData(ticker) // This can throw ValidationError, DataProviderError, ApiError
                    .then(data => ({ ticker, data }))
                    .catch(err => {
                        console.warn(`Failed to fetch market data for ${ticker}:`, err.message);
                        return { ticker, data: null, error: err.message }; // Return error info
                    })
             );
            const marketDataResults = await Promise.all(marketDataPromises);

            const dataMap: Record<string, MarketData> = {};
            const failedFetches: string[] = [];
            marketDataResults.forEach(result => {
              if (result.data) {
                 dataMap[result.ticker] = result.data;
                 successfulMarketDataFetches++;
              } else if (result.error) {
                 failedFetches.push(`${result.ticker}: ${result.error}`);
              }
            });

            // Merge broker-provided data (if any) with fetched data
            const initialMap: Record<string, MarketData> = {};
             fetchedPositions.forEach(pos => {
                 if (pos.current_price !== undefined) {
                     initialMap[pos.ticker] = {
                         ticker: pos.ticker,
                         price: pos.current_price,
                         timestamp: new Date(), // Use current time for broker data
                         yield_value: pos.yield_value,
                         duration: pos.duration,
                     };
                 }
             });

            setMarketDataMap({ ...initialMap, ...dataMap });

             if (failedFetches.length > 0) {
                 const warningMsg = `Could not load market data for ${failedFetches.length} position(s): ${failedFetches.join('; ')}. Portfolio value may be incomplete.`;
                 setPartialDataWarning(warningMsg);
                 toast({ variant: "warning", title: "Partial Market Data", description: `Could not load data for ${failedFetches.length} position(s).` });
             }

        } else {
            setMarketDataMap({}); // No positions, clear map
            setPositions([]); // Set to empty array if fetch was successful but returned none
        }

      } catch (err: any) {
        console.error("Failed to fetch portfolio data:", err);
        let errorMessage = `Failed to load portfolio data.`;
         if (err instanceof BrokerConnectionError || err instanceof AuthorizationError) {
             errorMessage = `Broker Error: ${err.message}`;
         } else if (err instanceof ApiError) {
             errorMessage = `API Error: ${err.message}`;
         } else {
             errorMessage += ` ${err.message || 'Check API/backend.'}`;
         }
        setError(errorMessage);
         setPositions([]); // Ensure positions is an empty array on error
         setMarketDataMap({});
         toast({ variant: "destructive", title: "Portfolio Load Failed", description: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]); // Add toast dependency

   // Fetch historical chart data with error handling
   useEffect(() => {
    if (!chartTicker || error) { // Don't fetch chart data if initial load failed
      setChartData([]);
      setLoadingChart(false);
      setChartError(error ? "Cannot load chart due to initial portfolio error." : null); // Set chart error if main error exists
      return;
    }

    const fetchChartData = async () => {
      setLoadingChart(true);
      setChartError(null); // Clear previous chart error
      setChartData([]);
      try {
        console.log(`Fetching chart data for: ${chartTicker}, range: ${chartRange}`);
        const history = await getHistoricalData(chartTicker, chartRange); // Can throw ValidationError, DataProviderError, ApiError

         if (!Array.isArray(history)) { // Validate response format
             throw new Error("Received invalid historical data format.");
         }
         if (history.length === 0) {
             console.warn(`No historical data returned for ${chartTicker} in range ${chartRange}.`);
             // Set specific message for no data, not necessarily an error
             setChartError(`No historical data available for ${chartTicker} (${chartRange.toUpperCase()}).`);
         }

         const formattedHistory = history.map(item => ({
             date: item.date,
             value: item.value,
             price: item.value,
         }));
        setChartData(formattedHistory);
      } catch (err: any) {
        console.error(`Failed to fetch historical data for ${chartTicker}:`, err);
        let chartErrMsg = `Could not load chart data for ${chartTicker}.`;
         if (err instanceof ValidationError) {
             chartErrMsg = `Chart Error: ${err.message}`;
         } else if (err instanceof DataProviderError) {
             chartErrMsg = `Chart Data Error: ${err.message}`;
         } else if (err instanceof ApiError) {
             chartErrMsg = `Chart API Error: ${err.message}`;
         } else {
             chartErrMsg += ` ${err.message || 'Check API.'}`;
         }
        setChartError(chartErrMsg);
        setChartData([]); // Clear data on error
         // Optionally show a toast for chart errors too
         // toast({ variant: "destructive", title: "Chart Error", description: chartErrMsg });
      } finally {
        setLoadingChart(false);
      }
    };

    fetchChartData();
   }, [chartTicker, chartRange, error, toast]); // Add error and toast


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

   // Determine overall alert state
   const showAlert = error || partialDataWarning;
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
        ) : showAlert ? ( // Show main error/warning first if present
            <Alert variant={alertVariant}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alertTitle}</AlertTitle>
                <AlertDescription>{alertDescription || "An error occurred."}</AlertDescription>
            </Alert>
        ) : (
          <>
            {/* Portfolio Summary */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
               <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <p className="text-3xl font-bold">{formatCurrency(portfolioValue)}</p>
                 {partialDataWarning && ( // Show specific warning for incomplete value calculation
                     <p className="text-xs text-yellow-600 dark:text-yellow-400">(Value calculation may be incomplete)</p>
                 )}
              </div>
              <div className={`flex items-center space-x-1 ${getGainLossColor(totalGainLoss)}`}>
                 {renderGainLossIcon(totalGainLoss)}
                 <span className="font-medium text-lg">
                    {formatCurrency(totalGainLoss)}
                 </span>
                  <span className="text-sm">
                    ({formatPercent(totalGainLossPercent)})
                 </span>
                  <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="ml-1 p-0 appearance-none border-none bg-transparent cursor-help" aria-label="Show gain/loss info">
                                <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Total unrealized gain/loss based on average cost vs current market value.</p>
                            {partialDataWarning && <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Market value calculation may be incomplete.</p>}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Performance Chart Section */}
             <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center">
                   <LineChartIcon className="mr-2 h-5 w-5 text-primary"/> Performance: {chartTicker || 'Select Holding'}
                </h3>
                 {/* Chart Error Display */}
                 {chartError && !loadingChart && (
                     <Alert variant="destructive" className="mb-2">
                         <AlertTriangle className="h-4 w-4" />
                         <AlertTitle>Chart Error</AlertTitle>
                         <AlertDescription>{chartError}</AlertDescription>
                     </Alert>
                 )}
                <div className="h-[250px] w-full relative border rounded-md p-2">
                    {loadingChart ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md"> <Skeleton className="h-full w-full" /> <span className="absolute text-sm text-muted-foreground">Loading chart data...</span> </div>
                    ) : chartData.length === 0 || !chartTicker ? (
                         // Show message if loading finished but no data or ticker selected (and no critical error shown above)
                         !chartError && <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md"> <p className="text-sm text-muted-foreground p-4 text-center"> {chartTicker ? `No historical data available for ${chartTicker} (${chartRange.toUpperCase()}).` : 'Select a holding from the table below to view its chart.'} </p> </div>
                    ) : (
                        // Render chart only if data exists and no chart-specific error
                        !chartError &&
                        <>
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                     <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value, index) => { try { const date = new Date(value + 'T00:00:00Z'); if (isNaN(date.getTime())) return ''; const numPoints = chartData.length; if (chartRange === '1m') { const wi = Math.max(1, Math.floor(numPoints / 4)); return wi > 0 && (index === 0 || index === numPoints - 1 || index % wi === 0) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : ''; } else if (chartRange === '6m') { const mi = Math.max(1, Math.floor(numPoints / 6)); return mi > 0 && (index === 0 || index === numPoints - 1 || index % mi === 0) ? date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) : ''; } else if (chartRange === '1y') { const qi = Math.max(1, Math.floor(numPoints / 4)); return qi > 0 && (index === 0 || index === numPoints - 1 || index % qi === 0) ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }) : ''; } else { return ''; } } catch (e) { return ''; } }} interval="preserveStartEnd" minTickGap={chartRange === '1m' ? 5 : 15} />
                                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={5} domain={['dataMin - (dataMax-dataMin)*0.05', 'dataMax + (dataMax-dataMin)*0.05']} tickFormatter={(value) => formatCurrency(value)} width={55} />
                                     {chartData.some(d => d.yield !== undefined) && (
                                         <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={5} domain={['auto', 'auto']} tickFormatter={(value) => formatPercent(value)} width={45} />
                                     )}
                                    <ChartTooltip cursor={true} content={ <ChartTooltipContent labelFormatter={(label) => { try { return new Date(label + 'T00:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }); } catch { return label; } }} formatter={(value, name) => name === 'price' ? formatCurrency(value as number) : name === 'yield' ? formatPercent(value as number) : value} indicator="dot" labelClassName="text-sm font-semibold" /> } />
                                     <Line yAxisId="left" dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} name="Price" dot={false} activeDot={{ r: 4, strokeWidth: 1 }} />
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
                                const currentPriceOrYield = pos.current_price ?? currentMarketData?.price;
                                const currentYield = pos.yield_value ?? currentMarketData?.yield_value;
                                const marketValue = pos.market_value ?? (currentPriceOrYield !== undefined && pos.asset_type !== AssetType.OTHER ? pos.quantity * currentPriceOrYield : undefined); // Avoid value calc for yield indices
                                const costBasis = pos.quantity * pos.averagePrice;
                                const gainLoss = pos.unrealized_pnl ?? (marketValue !== undefined ? marketValue - costBasis : undefined);
                                const gainLossPercent = (gainLoss !== undefined && costBasis > 0) ? (gainLoss / costBasis) * 100 : 0;
                                const isSelected = pos.ticker === chartTicker;
                                const isChartable = currentMarketData !== undefined || pos.current_price !== undefined || pos.asset_type === AssetType.OTHER; // Check if data exists or it's a yield index

                                const formattedQuantity = pos.asset_type === AssetType.SOVEREIGN_BOND || pos.asset_type === AssetType.TREASURY_BILL
                                     ? formatCurrency(pos.quantity, true)
                                     : pos.quantity.toLocaleString();

                                const displayPriceOrYield = pos.asset_type === AssetType.OTHER
                                    ? formatPercent(currentPriceOrYield)
                                    : formatCurrency(currentPriceOrYield);

                                return (
                                    <TableRow
                                        key={pos.ticker}
                                        className={`hover:bg-muted/50 ${isSelected ? 'bg-primary/10 hover:bg-primary/15' : ''} ${isChartable ? 'cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
                                        onClick={() => isChartable && setChartTicker(pos.ticker)}
                                        tabIndex={isChartable ? 0 : -1} // Make non-chartable rows non-focusable
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && isChartable && setChartTicker(pos.ticker)}
                                        aria-disabled={!isChartable}
                                        title={!isChartable ? "Chart data unavailable" : `View chart for ${pos.ticker}`}
                                    >
                                        <TableCell className={`font-medium flex items-center gap-1.5 ${isSelected ? 'text-primary' : ''}`}>
                                             {pos.asset_type === AssetType.SOVEREIGN_BOND || pos.asset_type === AssetType.TREASURY_BILL ? <Landmark className="h-3 w-3 text-muted-foreground"/> : pos.asset_type === AssetType.OTHER ? <LineChartIcon className="h-3 w-3 text-muted-foreground"/> : <DollarSign className="h-3 w-3 text-muted-foreground"/>}
                                             {pos.ticker}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground capitalize">{(pos.asset_type || 'N/A').replace('_', ' ')}</TableCell>
                                        <TableCell className="text-right">{formattedQuantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(pos.averagePrice)}</TableCell>
                                        <TableCell className="text-right">
                                             {currentPriceOrYield !== undefined ? displayPriceOrYield : <span className="text-xs text-destructive italic">N/A</span>}
                                             {currentYield !== undefined && pos.asset_type !== AssetType.OTHER && <span className="block text-xs text-muted-foreground">({formatPercent(currentYield)})</span>}
                                         </TableCell>
                                        <TableCell className="text-right font-medium">
                                             {marketValue !== undefined ? formatCurrency(marketValue) : <span className="text-xs text-muted-foreground italic">N/A</span>}
                                        </TableCell>
                                        <TableCell className={`text-right ${getGainLossColor(gainLoss)}`}>
                                            {gainLoss !== undefined ? ( <> {formatCurrency(gainLoss)} <span className="block text-xs">({formatPercent(gainLossPercent)})</span> </> ) : <span className="text-xs text-muted-foreground italic">N/A</span>}
                                        </TableCell>
                                    </TableRow>
                                )
                             })
                        ) : (
                             // Show message only if loading finished and no positions (and no critical error)
                             !loading && !error && <TableRow> <TableCell colSpan={7} className="text-center text-muted-foreground h-24"> No holdings found. </TableCell> </TableRow>
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

    