import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartStore } from "../types";

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      addToCart: (product, quantity) => {
        const currentItems = get().items;
        const existing = currentItems.find((item) => item.id === product.id);

        if (existing) {
          set({
            items: currentItems.map((item) =>
              item.cartItemId === existing.cartItemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: product.id,
                cartItemId: generateId(),
                name: product.name,
                price_excl_vat: product.price_excl_vat,
                vat_category: product.vat_category,
                quantity,
                image_url: product.image_url ?? undefined,
                stock: product.stock,
              },
            ],
          });
        }
      },

      removeFromCart: (cartItemId) =>
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) }),

      updateQuantity: (cartItemId, quantity) =>
        set({
          items:
            quantity <= 0
              ? get().items.filter((i) => i.cartItemId !== cartItemId)
              : get().items.map((i) =>
                  i.cartItemId === cartItemId ? { ...i, quantity } : i
                ),
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "fruicroc-cart-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
