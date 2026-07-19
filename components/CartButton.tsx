"use client";

import { useCartStore } from "@/store/cartStore";

export default function CartButton() {
  const items = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <button
      type="button"
      onClick={toggleCart}
      aria-label="Cart"
      className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white shadow-[0_1px_3px_rgba(58,36,32,.12)]"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5C3A2E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -end-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--primary)] px-1 text-[10.5px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
