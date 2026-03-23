import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { baseAuth } from "./services/auth.service";
import { profileService } from "./services/profile.service";
import { categoryService } from "./services/category.service";
import { productService } from "./services/product.service";
import { productStockService } from "./services/product-stock.service";
import { branchService } from "./services/branch.service";
import { userService } from "./services/user.service";
import { orderService } from "./services/order.service";
import { customerService } from "./services/customer.service";
import { paymentService } from "./services/payment.service";
import { salesReportService } from "./services/sales-report.service";
import { stockMovementsService } from "./services/stock-movements.service";
import { aiInsightService } from "./services/ai-insight.service";
import { roleService } from "./services/role.service";
import { taxService } from "./services/tax.service";
import { supplierService } from "./services/supplier.service";
import { userLogService } from "./services/user-log.service";
import { purchasingApi } from "./services/purchasing.service";
import { posSessionApi } from "./services/pos-session.service";
import { accountingApi } from "./services/accounting.service";
import { expenseApi } from "./services/expense.service";
import { stockTakeApi } from "./services/stock-take.service";
import { productBatchService } from "./services/product-batch.service";
import { promotionService } from "./services/promotion.service";

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
    [supplierService.reducerPath]: supplierService.reducer,
    [userLogService.reducerPath]: userLogService.reducer,
    [purchasingApi.reducerPath]: purchasingApi.reducer,
    [posSessionApi.reducerPath]: posSessionApi.reducer,
    [accountingApi.reducerPath]: accountingApi.reducer,
    [expenseApi.reducerPath]: expenseApi.reducer,
    [stockTakeApi.reducerPath]: stockTakeApi.reducer,
    [productBatchService.reducerPath]: productBatchService.reducer,
    [promotionService.reducerPath]: promotionService.reducer
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
      supplierService.middleware,
      userLogService.middleware,
      purchasingApi.middleware,
      posSessionApi.middleware,
      accountingApi.middleware,
      expenseApi.middleware,
      stockTakeApi.middleware,
      productBatchService.middleware,
      promotionService.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const allApis = [
  baseAuth,
  profileService,
  categoryService,
  productService,
  productStockService,
  branchService,
  userService,
  orderService,
  customerService,
  paymentService,
  salesReportService,
  stockMovementsService,
  aiInsightService,
  roleService,
  taxService,
  supplierService,
  userLogService,
  purchasingApi,
  posSessionApi,
  accountingApi,
  expenseApi,
  stockTakeApi,
  productBatchService,
  promotionService
];

export const resetAllApiStates = (dispatch: AppDispatch) => {
  allApis.forEach((api) => dispatch(api.util.resetApiState()));
};

setupListeners(store.dispatch);
