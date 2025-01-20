import { MongoClient, ObjectId } from "mongodb";
import { User } from "../models/user";
import { Holding } from "../models/holding";

const uri = "mongodb://localhost:27017";
// TODO: create global singleton client
const client = new MongoClient(uri);

const db = client.db("tradingDB");
const users = db.collection("users");
const userTransactions = db.collection("userTransactions");
const holdings = db.collection("holdings");

// 1. Find all transactions for user
// try {
//   const pipeline = [
//     {
//       $match: { name: "Kevin", email: "kevzhang2022@gmail.com" }
//     },
//     {
//       $lookup: {
//         from: "userTransactions",
//         localField: "_id",
//         foreignField: "user",
//         as: "transactions"
//       }
//     },
//     {
//       $project: { transactions: 1, _id: 0 }
//     }
//   ];
//   const myTransactions = await users.aggregate(pipeline).toArray();
//   console.dir(myTransactions);
// } catch (error) {
//   console.log(error);
// }

// If we assume that we store the user's ID somewhere in the application state (e.g. in React context), then we can avoid the joins for user queries
const user = await users.findOne<User>({
  name: "Kevin",
  email: "kevzhang2022@gmail.com",
});
if (!user) throw new Error("Could not find user!");

// 1. Find all user transactions with application-level join
const getUserTransactions = async (id: ObjectId) => {
  try {
    const myTransactions = await userTransactions
      .find({
        user: id,
      })
      .toArray();

    console.log("User transactions:");
    for (const tx of myTransactions) {
      console.dir(tx);
    }
  } catch (error) {
    console.log(error);
  }
};
// await getUserTransactions(user._id!);

// 2. Get all user holdings
const getUserHoldings = async (id: ObjectId) => {
  try {
    const myHoldings = await holdings
      .find({
        user: id,
      })
      .toArray();

    console.log("User holdings:");
    for (const holding of myHoldings) {
      console.dir(holding);
    }
  } catch (error) {
    console.log(error);
  }
};
// await getUserHoldings(user._id!);

// 3. Buy stock/fund
// Server-side validation: does the user have enough funds?
// TODO: maybe handle market/limit orders differently
const buyStockOrFund = async (
  userId: ObjectId,
  shares: number,
  costBasis: number,
  tickerSymbol: string
) => {
  // Validate user funds
  const user = await users.findOne(
    { _id: userId },
    { projection: { balance: 1 } }
  );

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  if (user.balance < costBasis) {
    throw new Error(
      `User does not have sufficient balance (${costBasis} needed) to buy ${shares} shares of ${tickerSymbol}`
    );
  }

  // Use MongoDB transaction
  const session = client.startSession();
  try {
    await client.withSession(async () => {
      // Update user balance
      await users.updateOne(
        { _id: userId },
        { $inc: { balance: -costBasis } },
        { session }
      );

      // Add userTransaction
      await userTransactions.insertOne(
        {
          user: userId,
          date: new Date(),
          type: "buy",
          amount: costBasis,
          tickerSymbol: tickerSymbol,
          shares: shares,
        },
        { session }
      );

      // Add/update holding
      await holdings.updateOne(
        {
          tickerSymbol: tickerSymbol,
        },
        {
          $setOnInsert: {
            user: userId,
            tickerSymbol: tickerSymbol,
          },
          $inc: {
            shares: shares,
            costBasis: costBasis,
          },
        },
        { session, upsert: true }
      );
    });
    console.log(
      `Successfully bought ${shares} shares of ${tickerSymbol} at $${
        costBasis / shares
      }/share`
    );
  } finally {
    await session.endSession();
  }
};
// await buyStockOrFund(user._id!, 10, 5000, "PIP");

// 4. Sell holding
// NOTE: needs to be paired with API call to get live information on the holding's price
const sellHolding = async (
  userId: ObjectId,
  tickerSymbol: string,
  shares: number,
  pricePerShare: number
) => {
  // Validate that user has enough shares to sell
  const holding = await holdings.findOne<Holding>({
    user: userId,
    tickerSymbol: tickerSymbol,
  });

  if (!holding || holding.shares < shares) {
    throw new Error(
      `User does not own enough shares of ${tickerSymbol} to sell ${shares} shares`
    );
  }

  // Perform MongoDB transaction
  const session = client.startSession();
  try {
    await client.withSession(async () => {
      const totalCash = shares * pricePerShare;

      // Update user balance
      await users.updateOne({ _id: userId }, { $inc: { balance: totalCash } });

      // Add transaction
      await userTransactions.insertOne({
        user: userId,
        date: new Date(),
        type: "sell",
        amount: totalCash,
        tickerSymbol: tickerSymbol,
        shares: shares,
      });

      // Update holding information
      const avgCostBasis = holding.costBasis / holding.shares;
      await holdings.updateOne(
        {
          user: userId,
          tickerSymbol: tickerSymbol,
        },
        {
          $inc: { shares: -shares, costBasis: -(avgCostBasis * shares) },
        }
      );
    });
    console.log(
      `Successfully sold ${shares} shares of ${tickerSymbol} at $${pricePerShare}/share`
    );
  } finally {
    await session.endSession();
  }
};
// await sellHolding(user._id!, "NVDA", 2, 800);

// 5. Add funds
// TODO: add Plaid/bank integration to directly read user's account balance?
const addFunds = async (userId: ObjectId, amount: number) => {
  await users.updateOne({ _id: userId }, { $inc: { balance: amount } });
  console.log(`Successfully add $${amount} in funds to user balance`);
};
// await addFunds(user._id!, 10000);

// 6. Withdraw funds
const withdrawFunds = async (userId: ObjectId, amount: number) => {
  // Validate that the user has enough funds to withdraw
  const user = await users.findOne(
    { _id: userId },
    { projection: { balance: 1 } }
  );

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  if (user.balance < amount) {
    throw new Error(
      `User does not have sufficient balance to withdraw $${amount}`
    );
  }

  // Perform withdrawal
  await users.updateOne({ _id: userId }, { $inc: { balance: -amount } });
  console.log(`Successfully withdrew $${amount}`);
};
// await withdrawFunds(user._id!, 10000);

// 7. Update user info
// We are assuming that `updatedValues` contains valid keys; schema validation can be added later if necessary
const updateUserInfo = async (
  userId: ObjectId,
  updatedValues: Record<string, any>
) => {
  await users.updateOne(
    { _id: userId },
    { $set: updatedValues }
  );
  console.log("Successfully updated user info");
};
// await updateUserInfo(user._id!, {
//   age: 24,
//   email: "n1v3x@tamu.edu"
// });

client.close();
