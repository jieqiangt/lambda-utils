import { MongoClient } from "mongodb";
import { ApiError } from "./errorUtils.js";
import { v4 as uuidv4 } from "uuid";

export async function connectClient() {
  try {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_URI}`;
    const client = new MongoClient(uri);
    await client.connect();
    console.log("MongoDB Client Connected!");
    return client;
  } catch (err) {
    throw new ApiError({
      title: "Database Client Error",
      status: 503,
      message: err,
    });
  }
}

export async function connectDb(client, dbName) {
  try {
    const db = await client.db(dbName);
    console.log(`MongoDB Database ${dbName} connected!`);
    return db;
  } catch (err) {
    throw new ApiError({
      title: "Database Connection Error",
      status: 503,
      message: err,
    });
  }
}

export async function insertOneToCollection(
  client,
  dbName,
  collectionName,
  payload
) {
  const db = await connectDb(client, dbName);

  try {
    const result = await db.collection(collectionName).insertOne(payload);
    console.log("MongoDB Insertion Success");
    return result;
  } catch (err) {
    if (err.code === 11000) {
      return {
        error: {
          message: err,
        },
      };
    }
    throw new ApiError({
      title: "Database Insertion Error",
      status: 503,
      message: err,
    });
  }
}

export async function getOneFromCollection(
  client,
  dbName,
  collectionName,
  payload,
  returnRequired = true
) {
  const db = await connectDb(client, dbName);
  try {
    const result = await db.collection(collectionName).findOne(payload);
    if (!result && returnRequired) {
      throw new ApiError({
        title: "Database Query Error",
        status: 503,
        message: "No result returned from MongoDB..",
      });
    }
    console.log("MongoDB Database Query Completed");
    return result;
  } catch (err) {
    throw new ApiError({
      title: "Database Query Error",
      status: 503,
      message: err,
    });
  }
}

export async function updateOneFromCollection(
  client,
  dbName,
  collectionName,
  filter,
  update,
  options = {}
) {
  const db = await connectDb(client, dbName);

  try {
    const result = await db
      .collection(collectionName)
      .updateOne(filter, { $set: update }, options);
    console.log("MongoDB Database Update Completed");
    return result;
  } catch (err) {
    throw new ApiError({
      title: "Database Update Error",
      status: 503,
      message: err,
    });
  }
}

export function createReferenceId(concatString) {
  let baseId = uuidv4();
  const referenceId = `${concatString.slice(1, 2)}${baseId.slice(
    0,
    6
  )}${concatString.slice(0, 1)}${concatString.slice(2, 3)}`.toUpperCase();
  return { baseId, referenceId };
}
