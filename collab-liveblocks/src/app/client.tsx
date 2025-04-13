import { createClient } from "@liveblocks/client";

const client = createClient({
  // Connect with authEndpoint
  authEndpoint: async (room) => {
      const response = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: {
        Authentication: "<your own headers here>",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room }),
    });
    return await response.json();
    },
});
  