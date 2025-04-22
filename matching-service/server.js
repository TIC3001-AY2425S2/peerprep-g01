import app from './index.js';
import "dotenv/config";
import MatchSyncSocketController from "./controller/match-sync-socket-controller.js"
import { createServer } from 'http';

const PORT = process.env.PORT || 3003;

try {
  const httpServer = createServer(app);
  httpServer.listen(PORT, () => {
    console.log(`Matching service is running on port ${PORT}`);
    MatchSyncSocketController.initializeSocket(httpServer);
  });
} catch(err) {
  console.error("Failed to connect to DB");
  console.error(err);
}
                        

