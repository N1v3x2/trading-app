import { restClient } from "@polygon.io/client-js";

const client = restClient(process.env.POLYGON_API_KEY);

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
// getStockAggregates("AAPL", "2024-12-20", "2025-01-01");

const getTickerDetails = async (symbol: string) => {
  try {
    const data = await client.reference.tickerDetails(symbol);
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving ticker details:", error);
  }
};
// getTickerDetails("AAPL");

const getDividends = async (symbol: string) => {
  try {
    const data = await client.reference.dividends({ ticker: symbol });
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving ticker details:", error);
  }
};
// getDividends("AAPL");

// Market Status (need this to determine whether to fetch real-time data)
const getMarketStatus = async () => {
  try {
    const data = await client.reference.marketStatus();
    console.log(data);
  } catch (error) {
    console.error("Error when retrieving ticker details:", error);
  }
};
getMarketStatus();

// Ticker: get live one-minute aggregate for individual stock/fund
// TODO: replace with websocket endpoint

// All Tickers: get live one-minute aggregate for list of stocks/funds

// Aggregates (bars) - for historical data

/*
Potentially useful:
- Market Holidays
- Moving Averages
- Daily open/close
*/

// Idea: cache API calls during afterhours; allow user option of toggling afterhours pricing on/off