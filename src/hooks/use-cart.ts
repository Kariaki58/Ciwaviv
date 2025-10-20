import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';
import { useToast } from './use-toast';

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateState = (items: CartItem[]) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { itemCount, total };
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,
      addItem: (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex((i) => i.id === item.id);

        let updatedItems;
        if (existingItemIndex > -1) {
          updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
        } else {
          updatedItems = [...currentItems, item];
        }
        
        const { itemCount, total } = calculateState(updatedItems);
        set({ items: updatedItems, itemCount, total });
      },
      removeItem: (itemId) => {
        const updatedItems = get().items.filter((item) => item.id !== itemId);
        const { itemCount, total } = calculateState(updatedItems);
        set({ items: updatedItems, itemCount, total });
      },
      updateItemQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        const updatedItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        const { itemCount, total } = calculateState(updatedItems);
        set({ items: updatedItems, itemCount, total });
      },
      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
            const { itemCount, total } = calculateState(state.items);
            state.itemCount = itemCount;
            state.total = total;
        }
      },
    }
  )
);
