import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedModel?: string;
}

function cartKey(productId: number, selectedModel?: string) {
  return `${productId}__${selectedModel ?? ''}`;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedModel?: string) => void;
  removeItem: (productId: number, selectedModel?: string) => void;
  updateQuantity: (productId: number, quantity: number, selectedModel?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, selectedModel) => {
        set((state) => {
          const key = cartKey(product.id, selectedModel);
          const existingItem = state.items.find(
            (item) => cartKey(item.product.id, item.selectedModel) === key
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                cartKey(item.product.id, item.selectedModel) === key
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity, selectedModel }] };
        });
      },
      removeItem: (productId, selectedModel) => {
        const key = cartKey(productId, selectedModel);
        set((state) => ({
          items: state.items.filter(
            (item) => cartKey(item.product.id, item.selectedModel) !== key
          ),
        }));
      },
      updateQuantity: (productId, quantity, selectedModel) => {
        const key = cartKey(productId, selectedModel);
        set((state) => ({
          items: state.items.map((item) =>
            cartKey(item.product.id, item.selectedModel) === key
              ? { ...item, quantity: Math.max(1, quantity) }
              : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce(
          (total, item) => total + Number(item.product.price) * item.quantity,
          0
        );
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'hitechdoctor-cart',
    }
  )
);
