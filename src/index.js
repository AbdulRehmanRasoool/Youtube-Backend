import { app } from "./app.js";
import 'dotenv/config'
import { databaseConnection } from "./database/index.js";

try {
    const port = process.env.PORT || 5000;
    await databaseConnection();
    app.listen(port, () => {
        console.log("Server is listening on port", port);
    });
} catch (error) {
    console.error("MongoDb connection error", error);
}