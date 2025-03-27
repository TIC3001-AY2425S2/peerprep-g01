import { RoomProvider, useOthers, useMyPresence, LiveblocksProvider } from "@liveblocks/react";
import { client } from "./liveblocksClient"; // Correct import

function CollabRoom() {
  const others = useOthers();
  const [presence, setPresence] = useMyPresence();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Live Collaboration Room</h1>
      
      {/* Live Cursor Example */}
      <p>Users Online: {others.count}</p>

      {/* Shared Text Input */}
      <textarea
        className="border p-2 w-full mt-4"
        placeholder="Type something..."
        onChange={(e) => setPresence({ text: e.target.value })}
      />
    </div>
  );
}

export default function Collab() {
  return (
    <LiveblocksProvider publicApiKey="pk_prod_lfho1TJdWTVf_-Useas6hKyTQvA-aYeBSRIM_cFp8mKN6xfBPY3auBl-P5I7NWx1" client={client}>  {/* Wrap only in LiveblocksProvider */}
      <RoomProvider id="collab-room" client={client}>
        <CollabRoom />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
