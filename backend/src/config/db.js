import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

mongoose.set("strictQuery", true);

export async function connectDb() {
  mongoose.connection.on("connected", () => logger.info("mongo: connected"));
  mongoose.connection.on("disconnected", () => logger.warn("mongo: disconnected"));
  mongoose.connection.on("error", (err) => logger.error({ err }, "mongo: error"));

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: env.NODE_ENV !== "production",
  });

  // In production, build indexes once on boot rather than auto on every write.
  if (env.NODE_ENV === "production") {
    for (const modelName of mongoose.modelNames()) {
      try {
        await mongoose.model(modelName).syncIndexes();
      } catch (err) {
        logger.error({ err, modelName }, "mongo: syncIndexes failed");
      }
    }
  }
}

export async function disconnectDb() {
  await mongoose.disconnect();
}
