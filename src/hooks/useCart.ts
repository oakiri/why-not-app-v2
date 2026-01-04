import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, Cart, MenuItem, Modifier } from '../types';
import { DEFAULTS } from '../constants';

interface CartState extends Cart {
  // Actions
  addItem: (item: MenuItem, quantity?: number, modifiers?: Modifier[], notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (discount: number) => void;
  setDeliveryFee: (fee: number) => void;
  calculateTotals: () => void;
}

const calculateItemSubtotal = (item: CartItem): number => {
  const modifiersTotal = item.modifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0;
  return (item.price + modifiersTotal) * item.quantity;
};

const calculateTax = (subtotal: number): number => {
  return subtotal * DEFAULTS.TAX_RATE;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      deliveryFee: 0,
      total: 0,
      itemCount: 0,

      // Actions
      addItem: (item, quantity = 1, modifiers = [], notes = '') => {
        const state = get();
        const existingItemIndex = state.items.findIndex(
          (cartItem) =>
            cartItem.itemId === item.id &&
            JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers) &&
            cartItem.notes === notes
        );

        let newItems: CartItem[];

        if (existingItemIndex >= 0) {
          // Item already exists, update quantity
          newItems = [...state.items];
          newItems[existingItemIndex].quantity += quantity;
          newItems[existingItemIndex].subtotal = calculateItemSubtotal(newItems[existingItemIndex]);
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${item.id}-${Date.now()}`,
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity,
            image: item.image,
            modifiers,
            notes,
            subtotal: calculateItemSubtotal({
              id: '',
              itemId: item.id,
              name: item.name,
              price: item.price,
              quantity,
              modifiers,
              notes,
              subtotal: 0,
              addedAt: new Date(),
            }),
            addedAt: new Date(),
          };
          newItems = [...state.items, newItem];
        }

        set({ items: newItems });
        get().calculateTotals();
      },

      removeItem: (itemId) => {
        const state = get();
        const newItems = state.items.filter((item) => item.id !== itemId);
        set({ items: newItems });
        get().calculateTotals();
      },

      updateItemQuantity: (itemId, quantity) => {
        const state = get();
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const newItems = state.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity,
              subtotal: calculateItemSubtotal({ ...item, quantity }),
            };
          }
          return item;
        });

        set({ items: newItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          discount: 0,
          deliveryFee: 0,
          total: 0,
          itemCount: 0,
        });
      },

      applyDiscount: (discount) => {
        set({ discount });
        get().calculateTotals();
      },

      setDeliveryFee: (fee) => {
        set({ deliveryFee: fee });
        get().calculateTotals();
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = calculateTax(subtotal);
        const total = subtotal + tax - state.discount + state.deliveryFee;
        const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

        set({
          subtotal,
          tax,
          total,
          itemCount,
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selector hooks for better performance
export const useCartItems = () => useCart((state) => state.items);
export const useCartTotal = () => useCart((state) => state.total);
export const useCartItemCount = () => useCart((state) => state.itemCount);
export const useCartSubtotal = () => useCart((state) => state.subtotal);
export const useCartTax = () => useCart((state) => state.tax);
export const useCartDiscount = () => useCart((state) => state.discount);
export const useCartDeliveryFee = () => useCart((state) => state.deliveryFee);

// Action hooks
export const useCartActions = () => {
  const addItem = useCart((state) => state.addItem);
  const removeItem = useCart((state) => state.removeItem);
  const updateItemQuantity = useCart((state) => state.updateItemQuantity);
  const clearCart = useCart((state) => state.clearCart);
  const applyDiscount = useCart((state) => state.applyDiscount);
  const setDeliveryFee = useCart((state) => state.setDeliveryFee);

  return {
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    applyDiscount,
    setDeliveryFee,
  };
};

export default useCart;
