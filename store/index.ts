import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { baseAuth } from "./services/auth.service";

export const store = configureStore({
  reducer: {
    [baseAuth.reducerPath]: baseAuth.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseAuth.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
