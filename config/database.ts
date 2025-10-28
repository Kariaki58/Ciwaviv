import mongoose, { Mongoose } from "mongoose";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

const globalWithMongoose = globalThis as unknown as { _mongoose?: MongooseCache };

const cached: MongooseCache = globalWithMongoose._mongoose || { conn: null, promise: null };

async function connectToDatabase(): Promise<Mongoose> {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(uri).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}


globalWithMongoose._mongoose = cached;

export default connectToDatabase;