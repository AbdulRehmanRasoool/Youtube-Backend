import mongoose from "mongoose";

const databaseConnection = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DATABASE}`);
    } catch (error) {
        console.error("MongoDb connection error", error);
    }
}

export { databaseConnection }