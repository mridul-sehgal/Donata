import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  //checking in case database connection already exists because of edge connection
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL || "");
    connection.isConnected = db.connections[0].readyState;
    console.log("DATABASE CONNECTED SUCCESSFULLY");
  } catch (error) {
    console.log("DATABAS CONNECTION FAILED!!!",error);
    process.exit(1)
  }
}

export default dbConnect;
