import { restClient } from "@polygon.io/client-js";

const client = restClient(process.env.POLYGON_API_KEY);

// Aggregates (bars) - for historical data
const getStockAggregates = async (
  symbol: string,
  from: string,
  to: string,
  timeUnit: string = "day"
) => {
  try {
    const data = await client.stocks.aggregates(symbol, 1, timeUnit, from, to);
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving aggregates:", error);
  }
};
// await getStockAggregates("AAPL", "2024-12-20", "2025-01-01");

const getTickerDetails = async (symbol: string) => {
  try {
    const data = await client.reference.tickerDetails(symbol);
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving ticker details:", error);
  }
};
// await getTickerDetails("AAPL");

// Market Status (need this to determine whether to fetch real-time data)
const getMarketStatus = async () => {
  try {
    const data = await client.reference.marketStatus();
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving market status:", error);
  }
};
// await getMarketStatus();

// Ticker: get live one-minute aggregate for individual stock/fund
// TODO: replace with websocket endpoint
const getTicker = async (symbol: string) => {
  try {
    const data = await client.stocks.snapshotTicker(symbol);
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving ticker snapshot:", error);
  }
};
// await getTicker("AAPL");

// All Tickers: get live one-minute aggregate for list of stocks/funds
const getAllTickers = async (symbols: string[]) => {
  try {
    const query = symbols.join(",");
    const data = await client.stocks.snapshotAllTickers({ tickers: query });
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving all ticker snapshots:", error);
  }
};
// await getAllTickers(["AAPL", "MSFT", "NVDA"]);

/*
Potentially useful:
- Market Holidays
- Moving Averages
- Daily open/close
*/

// Idea: cache API calls during afterhours; allow user option of toggling afterhours pricing on/off
