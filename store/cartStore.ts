import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartStore } from "../types";
import { tierPrice, type WeightG } from "../lib/weights";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      addToCart: (product, weightG, quantity) => {
        const cartItemId = `${product.id}-${weightG}`;
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.cartItemId === cartItemId);

        if (existing) {
          set({
            items: currentItems.map((item) =>
              item.cartItemId === cartItemId
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
                cartItemId,
                name: product.name,
                weightG,
                unit_price_eur: tierPrice(weightG as WeightG),
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
      version: 2, // weight-tier cart — discard old carts
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
