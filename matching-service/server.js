import http from "http";
import index from "./index.js";
import "dotenv/config";

const port = process.env.PORT || 3003;

const server = http.createServer(index);

try{
  server.listen(port);
  console.log("Matching service server listening on http://localhost:" + port);
}

catch(err){
  console.error("Failed to connect to DB");
  console.error(err);
}
                        

