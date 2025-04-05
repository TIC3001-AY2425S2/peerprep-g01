"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  // return (
  //   <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
  //     {children}
  //   </LiveblocksProvider>
  // );

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      {children}
    </LiveblocksProvider>
  );
}


