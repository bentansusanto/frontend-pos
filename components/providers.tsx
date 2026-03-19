"use client";

import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";

import { SocketProvider } from "@/components/providers/socket-provider";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SocketProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </SocketProvider>
    </Provider>
  );
}
