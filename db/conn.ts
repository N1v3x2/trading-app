import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI!;
const client = new MongoClient(URI);
const db = client.db("tradingDB");
const users = db.collection("users");
const holdings = db.collection("holdings");
const userTransactions = db.collection("userTransactions");

export { users, holdings, userTransactions };
