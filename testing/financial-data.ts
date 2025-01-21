import { IAggs, IMarketStatus, ISnapshot, restClient } from "@polygon.io/client-js";

const client = restClient(process.env.POLYGON_API_KEY);

// TODO: define TS interfaces/types
const getTickerDetails = async (symbol: string) => {
  try {
    const response = await client.reference.tickerDetails(symbol);
    const data = response.results;
    if (!data) {
      throw new Error("Received no data for");
    }

    /*
    What am I interested in?
    1. Address (optional)
    2. Icon/logo (optional)
    3. Description (optional)
    4. Homepage URL (optional)
    5. Locale (US, global) (optional)
    6. Asset type (stock, ETF, crypto, etc.) -- for full list, see https://polygon.io/docs/stocks/get_v3_reference_tickers_types
    7. Market cap (optional)
    8. Company name (optional)
    */
    return {
      name: data.name,
      type: data.type,
      locale: data.locale,
      address: data.address,
      description: data.description,
      logo_url: data.branding?.logo_url,
      icon_url: data.branding?.icon_url, // Cacheable
      homepage_url: data.homepage_url,
      market_cap: data.market_cap,
    };
  } catch (err) {
    throw new Error(`Error when retrieving ticker details for ${symbol}: ${err}`);
  }
};
// console.log(await getTickerDetails("QQQM"));

// Market Status (need this to determine whether to fetch real-time data)
const getMarketStatus = async () => {
  try {
    const data: IMarketStatus = await client.reference.marketStatus();

    /*
    What flags am I interested in?
    1. afterHours
    2. earlyHours
    3. exchanges { nasdaq, nyse, otc }
    4. market (overall status)
    */
    return {
      afterHours: data.afterHours,
      earlyHours: data.earlyHours,
      nasdaq: data.exchanges?.nasdaq,
      nysq: data.exchanges?.nyse,
    }
  } catch (err) {
    throw new Error(`Error when retrieving market status: ${err}`);
  }
};
// console.log(await getMarketStatus());

// Ticker: get live one-minute aggregate for individual stock/fund
// TODO: replace with websocket endpoint
const getTickerSnapshot = async (symbol: string) => {
  try {
    const response: ISnapshot = await client.stocks.snapshotTicker(symbol);
    const data = response.ticker;
    if (!data) {
      throw new Error("Received no data");
    }

    /*
    What am I interested in?
    1. Today's change (percentage)
    2. Today's change (points)
    3. Day open
    4. Day high
    5. Day low
    6. Today's volume
    7. Previous minute close (during market hours)
    8. Previous minute volume (during market hours)
    9. Last recorded timestamp (Unix Msec) 
    */
    return {
      symbol: data.ticker,
      dayChangePercent: data.todaysChangePerc,
      dayChange: data.todaysChange,
      dayOpen: data.day?.o,
      dayHigh: data.day?.h,
      dayLow: data.day?.l,
      dayVolume: data.day?.v,
      lastClose: data.min?.c,
      lastVolume: data.min?.v,
      lastTimestamp: data.min?.t,
    };
  } catch (err) {
    throw new Error(`Error when retrieving ticker snapshot for ${symbol}: ${err}`);
  }
};
// console.log(await getTickerSnapshot("AAPL"));

// All Tickers: get live one-minute aggregate for list of stocks/funds
const getAllTickerSnapshots = async (symbols: string[]) => {
  try {
    const query = symbols.join(",");
    const response = await client.stocks.snapshotAllTickers({ tickers: query });
    const data = response.tickers;
    if (!data) {
      throw new Error("Received no data");
    }

    return data.map(snapshot => ({
      symbol: snapshot.ticker,
      dayChangePercent: snapshot.todaysChangePerc,
      dayChange: snapshot.todaysChange,
      dayOpen: snapshot.day?.o,
      dayHigh: snapshot.day?.h,
      dayLow: snapshot.day?.l,
      dayVolume: snapshot.day?.v,
      lastClose: snapshot.min?.c,
      lastVolume: snapshot.min?.v,
      lastTimestamp: snapshot.min?.t,
    }));
  } catch (err) {
    throw new Error(`Error when retrieving ticker snapshots for ${symbols}: ${err}`);
  }
};
// console.log(await getAllTickerSnapshots(["AAPL", "MSFT", "NVDA"]));

// // Aggregates (bars) - for historical data
// const getStockAggregates = async (
//   symbol: string,
//   from: string,
//   to: string,
//   timeUnit: string = "day"
// ) => {
//   try {
//     const MULTIPLIER = 1;
//     const data: IAggs = await client.stocks.aggregates(
//       symbol,
//       MULTIPLIER,
//       timeUnit,
//       from,
//       to
//     );
//     if (!data) {
//       throw new Error(
//         `Empty API response for ${symbol} in timeframe: ${from} - ${to} with time unit ${timeUnit}`
//       );
//     }
//     const barCnt = data.resultsCount;
//     // What data am I interested in?
//     // 1. Closing price (for each time unit)
//     // 2. Volume (for each time unit)

//     console.log(data);
//   } catch (error) {
//     console.error("Error when retrieving aggregates:", error);
//   }
// };
// // await getStockAggregates("AAPL", "2024-12-20", "2025-01-01");

/*
Potentially useful:
- Market Holidays
- Moving Averages
- Daily open/close
*/

// Idea: cache API calls during afterhours; allow user option of toggling afterhours pricing on/off
