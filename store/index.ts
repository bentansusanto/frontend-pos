import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { baseAuth } from "./services/auth.service";
import { branchService } from "./services/branch.service";
import { categoryService } from "./services/category.service";
import { customerService } from "./services/customer.service";
import { orderService } from "./services/order.service";
import { paymentService } from "./services/payment.service";
import { productStockService } from "./services/product-stock.service";
import { productService } from "./services/product.service";
import { profileService } from "./services/profile.service";
import { salesReportService } from "./services/sales-report.service";
import { stockMovementsService } from "./services/stock-movements.service";
import { userService } from "./services/user.service";
import { aiInsightService } from "./services/ai-insight.service";

export const store = configureStore({
  reducer: {
    [baseAuth.reducerPath]: baseAuth.reducer,
    [profileService.reducerPath]: profileService.reducer,
    [categoryService.reducerPath]: categoryService.reducer,
    [productService.reducerPath]: productService.reducer,
    [productStockService.reducerPath]: productStockService.reducer,
    [branchService.reducerPath]: branchService.reducer,
    [userService.reducerPath]: userService.reducer,
    [orderService.reducerPath]: orderService.reducer,
    [customerService.reducerPath]: customerService.reducer,
    [paymentService.reducerPath]: paymentService.reducer,
    [salesReportService.reducerPath]: salesReportService.reducer,
    [stockMovementsService.reducerPath]: stockMovementsService.reducer,
    [aiInsightService.reducerPath]: aiInsightService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseAuth.middleware,
      profileService.middleware,
      categoryService.middleware,
      productService.middleware,
      productStockService.middleware,
      branchService.middleware,
      userService.middleware,
      orderService.middleware,
      customerService.middleware,
      paymentService.middleware,
      salesReportService.middleware,
      stockMovementsService.middleware,
      aiInsightService.middleware,
    )
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
