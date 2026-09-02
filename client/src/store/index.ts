import { configureStore } from "@reduxjs/toolkit";
import { legheApi } from "./api/legheApi";
import { userApi } from "./api/userApi";
import { sportMonkApi } from "./api/sportMonkApi";
import { settingsApi } from "./api/settingsApi";
import { tempPronosticiApi } from "./api/tempPronostici";
import { syncedPoolDataApi } from "./api/syncedPoolDataApi";
import { schedinaApi } from "./api/schedinaApi";

export const store = configureStore({
  reducer: {
    [legheApi.reducerPath]: legheApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [sportMonkApi.reducerPath]: sportMonkApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [tempPronosticiApi.reducerPath]: tempPronosticiApi.reducer,
    [syncedPoolDataApi.reducerPath]: syncedPoolDataApi.reducer,
    [schedinaApi.reducerPath]: schedinaApi.reducer,
    // Aggiungi altri slice qui
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(legheApi.middleware)
      .concat(userApi.middleware)
      .concat(sportMonkApi.middleware)
      .concat(settingsApi.middleware)
      .concat(tempPronosticiApi.middleware)
      .concat(syncedPoolDataApi.middleware)
      .concat(schedinaApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
