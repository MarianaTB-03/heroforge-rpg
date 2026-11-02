import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Item } from '../types';
import { gameReset } from '../actions';
import { ITEMS_CATALOG } from '../data/itemsCatalog';

export interface InventoryState {
  catalog: Item[];
  equippedIds: string[];
}

const initialState: InventoryState = {
  catalog: ITEMS_CATALOG,
  equippedIds: [],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    toggleEquipItem(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.equippedIds.includes(id)) {
        state.equippedIds = state.equippedIds.filter((equipped) => equipped !== id);
      } else {
        state.equippedIds.push(id);
      }
    },

    clearEquipment(state) {
      state.equippedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(gameReset, (state) => {
      state.equippedIds = [];
    });
  },
});

export const { toggleEquipItem, clearEquipment } = inventorySlice.actions;

export default inventorySlice.reducer;
