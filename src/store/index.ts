import { configureStore, Action, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import statsReducer from './slices/statsSlice';
import inventoryReducer from './slices/inventorySlice';
import bossReducer from './slices/bossSlice';
import actionLogReducer from './slices/actionLogSlice';

export const store = configureStore({
  reducer: {
    stats: statsReducer,
    inventory: inventoryReducer,
    boss: bossReducer,
    actionLog: actionLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;

// Custom hooks tipados para usar en los componentes visuales
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
