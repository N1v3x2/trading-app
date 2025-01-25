import { MongoClient } from "mongodb";
import { User } from "../models/user";
import { UserTransaction } from "../models/userTransaction";
import { Holding } from "../models/holding";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const db = client.db("tradingDB");
const users = db.collection("users");
const holdings = db.collection("holdings");
const userTransactions = db.collection("userTransactions");

// Drop all collections
try {
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    await db.collection(collection.name).drop();
    console.log(`Dropped ${collection.name}`);
  }
  console.log("Successfully dropped all collections");
} catch (err) {
  console.error(err);
}

// Create collections
try {
  await db.createCollection("users");
  console.log("Created users collection");
  await db.createCollection("holdings");
  console.log("Created holdings collection");
  await db.createCollection("userTransactions");
  console.log("Created userTransactions collection");
} catch (err) {
  console.error(err);
}

// Seed collections
try {
  // Seed users
  const seedUsers: User[] = [
    {
      name: "Kevin",
      age: 20,
      email: "kevzhang2022@gmail.com",
      balance: 5000,
    },
    {
      name: "Jake",
      age: 30,
      email: "jake@gmail.com",
      balance: 23000,
    },
    {
      name: "Isaac",
      age: 18,
      email: "issac@gmail.com",
      balance: 25000,
    },
  ];
  await users.insertMany(seedUsers);
  console.log("Successfully seeded users");

  // Fetch users from DB to get their IDs
  const dbUsers: User[] = await users.find<User>({}).toArray();

  // Seed transactions
  const seedTransactions: UserTransaction[] = [
    {
      user: dbUsers[0]._id!,
      date: new Date(2008, 8, 15),
      type: "buy",
      amount: 20000,
      tickerSymbol: "AAPL",
      shares: 10,
    },
    {
      user: dbUsers[1]._id!,
      date: new Date(2020, 6, 12),
      type: "buy",
      amount: 15000,
      tickerSymbol: "NVDA",
      shares: 120,
    },
    {
      user: dbUsers[2]._id!,
      type: "deposit",
      amount: 5000,
      date: new Date(2013, 9, 14),
    },
    {
      user: dbUsers[0]._id!,
      date: new Date(2017, 2, 29),
      type: "withdraw",
      amount: 1000,
    },
    {
      user: dbUsers[1]._id!,
      date: new Date(2022, 4, 23),
      type: "sell",
      amount: 10000,
      tickerSymbol: "NVDA",
      shares: 72,
    },
  ];
  await userTransactions.insertMany(seedTransactions);
  console.log("Successfully seeded userTransactions");

  // Seed holdings
  const seedHoldings: Holding[] = [
    {
      user: dbUsers[0]._id!,
      tickerSymbol: "AAPL",
      shares: 100,
      costBasis: 20000,
    },
    {
      user: dbUsers[1]._id!,
      tickerSymbol: "NVDA",
      shares: 36,
      costBasis: 5000,
    },
  ];
  await holdings.insertMany(seedHoldings);
  console.log("Successfully seeded holdings");
} catch (err) {
  console.error(err);
}

// Create indexes
try {
  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  console.log("Successfully created index for users on email_1");
  await holdings.createIndex({ user: 1, tickerSymbol: 1 });
  console.log("Successfully created index for holdings on user_1_tickerSymbol_1");
  await userTransactions.createIndex({ user: 1, type: 1, date: -1 });
  console.log("Successfully created index for userTransactions on user_1_type_1_date-1")
} catch (err) {
  console.error(err);
}

client.close();
