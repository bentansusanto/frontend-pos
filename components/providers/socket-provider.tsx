"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch } from "react-redux";
import { productService } from "@/store/services/product.service";
import { productStockService } from "@/store/services/product-stock.service";
import { stockMovementsService } from "@/store/services/stock-movements.service";
import { stockTakeApi } from "@/store/services/stock-take.service";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Extract base URL from API URL (remove /api/v1 if present)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, "");
    
    console.log("Initializing WebSocket connection to:", socketUrl);
    
    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    });

    socketInstance.on("stock_take_updated", (data) => {
      console.log("Stock take updated via WebSocket:", data);
      // Invalidate tags to trigger refetch
      dispatch(stockTakeApi.util.invalidateTags(["StockTakes"]));
    });

    socketInstance.on("stock_updated", (data) => {
      console.log("Stock updated via WebSocket:", data);
      // Invalidate all related tags to refresh UI in real-time
      dispatch(productService.util.invalidateTags(["Products"]));
      dispatch(productStockService.util.invalidateTags(["ProductStocks"]));
      dispatch(stockMovementsService.util.invalidateTags(["StockMovements"]));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
