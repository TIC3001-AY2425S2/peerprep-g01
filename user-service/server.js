import http from "http";
import index from "./index.js";
import "dotenv/config";
import { connectToDB } from "./model/repository.js";

const port = process.env.PORT || 3001;
const server = http.createServer(index);

// Start server immediately to handle health checks
server.listen(port, () => {
  console.log("User service server listening on http://localhost:" + port);
});

// Function to handle DB connection with retries
async function connectWithRetry(retries = 5, interval = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to connect to MongoDB (attempt ${i + 1}/${retries})...`);
      await connectToDB();
      console.log("MongoDB Connected!");
      return;
    } catch (err) {
      console.error(`Failed to connect to DB (attempt ${i + 1}/${retries})`);
      console.error(err);
      if (i < retries - 1) {
        console.log(`Retrying in ${interval/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      } else {
        console.error("Max retries reached. Could not connect to MongoDB.");
      }
    }
  }
}

// Start connection attempts
connectWithRetry();

