"use client";

import { ReactNode, useMemo } from "react";
import { RoomProvider } from "@liveblocks/react/suspense";
import { useSearchParams } from "next/navigation";
import { ClientSideSuspense } from "@liveblocks/react";
import { Loading } from "@/components/Loading";

export function Room({ children }: { children: ReactNode }) {
  // const roomId = useRoomId("liveblocks:examples:nextjs-yjs-codemirror");
  const params = useSearchParams();
  const collabId = params?.get("collabId");
  if (!collabId) {
    return <div>Error: Missing collabId</div>;
  }
  // const roomId = useRoomId("");
  
  return (
    <RoomProvider
      id={collabId}
      initialPresence={{
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={<Loading />}>{children}</ClientSideSuspense>
    </RoomProvider>
  );
}

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
// function useRoomId(roomId: string) {
//   const params = useSearchParams();
//   const collabId = params?.get("collabId");
//   const username = params?.get("username");
//   console.log("collabId: ", collabId);
//   console.log("username:", username)
//   const exampleRoomId = useMemo(() => {
//     // return exampleId ? `${roomId}-${exampleId}` : roomId;
//     return collabId;
//   }, [roomId, collabId]);

//   return exampleRoomId;
// }
