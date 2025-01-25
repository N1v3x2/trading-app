import "express-async-errors";
import bodyParser from "body-parser";
import express from "express";
import { users } from "./db/conn";
import { userSchema, User } from "./models/user";
import { ZodError } from "zod";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json("Hello World!");
});

// TODO: create routers

// Middleware
app.use(bodyParser.json());

// 1. [POST] Create user (no authentication for now)
app.post("/v1/user", async (req, res) => {
  try {
    // Parse request body
    const newUser: User = userSchema.parse(req.body);

    // Check whether user already exists (as defined by their email)
    const existingUser = await users.findOne<User>({ email: newUser.email });
    if (existingUser) {
      res
        .status(409)
        .json({ error: "The new user's email matches an existing user's email" });
      return;
    }

    // Add user to DB
    await users.insertOne(newUser);

    const insertedUser = await users.findOne(
      { email: newUser.email },
      { projection: { _id: 1 } }
    );
    const userId = insertedUser!._id;

    // Return success response
    res.status(201).json({ userId: userId });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json(err.issues);
    } else {
      throw err;
    }
  }
});

// 2. [GET] Get user details


// 3. [GET] View portfolio

// 4. [GET] Get most updated info on single stock/fund

// 5. [POST] Buy stock/fund

// 6. [POST] Sell holding

// 7. [GET] Get all holdings aggregated over timeframe

// 8. [PATCH] Add funds

// 9. [PATCH] Remove funds

// 10. [PATCH] Update user info

// 11. [GET] View transaction history

// TODO: add authentication endpoint

// Error handling
// TODO: define error handler

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
