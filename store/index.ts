import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { aiInsightService } from "./services/ai-insight.service";
import { baseAuth } from "./services/auth.service";
import { branchService } from "./services/branch.service";
import { categoryService } from "./services/category.service";
import { customerService } from "./services/customer.service";
import { discountService } from "./services/discount.service";
import { orderService } from "./services/order.service";
import { paymentService } from "./services/payment.service";
import { productStockService } from "./services/product-stock.service";
import { productService } from "./services/product.service";
import { profileService } from "./services/profile.service";
import { roleService } from "./services/role.service";
import { salesReportService } from "./services/sales-report.service";
import { stockMovementsService } from "./services/stock-movements.service";
import { supplierService } from "./services/supplier.service";
import { taxService } from "./services/tax.service";
import { userLogService } from "./services/user-log.service";
import { userService } from "./services/user.service";

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
    [roleService.reducerPath]: roleService.reducer,
    [taxService.reducerPath]: taxService.reducer,
    [discountService.reducerPath]: discountService.reducer,
    [supplierService.reducerPath]: supplierService.reducer,
    [userLogService.reducerPath]: userLogService.reducer
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
      roleService.middleware,
      taxService.middleware,
      discountService.middleware,
      supplierService.middleware,
      userLogService.middleware
    )
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
