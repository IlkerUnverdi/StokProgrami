'use client';

import { useEffect, useMemo, useState } from 'react';
import {toNumberPrice} from '@/utils/number';
import type { CartItem } from '@/types/sales';
import type { ProductListItem } from '@/types/product';

const STORAGE_KEY = 'stokprogrami-sales-cart';
const CART_UPDATED_EVENT = 'stokprogrami-sales-cart-updated';

function readCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCartToStorage(cart: CartItem[]) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function useSalesCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const cartSubtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + toNumberPrice(item.product.salePrice) * item.quantity,
      0,
    );
  }, [cart]);
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    const syncCart = () => {
      setCart(readCartFromStorage());
      setCartHydrated(true);
    };

    syncCart();

    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener('storage', syncCart);
    window.addEventListener('focus', syncCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('focus', syncCart);
    };
  }, []);

  const cartQuantities = useMemo(() => {
    const map: Record<number, number> = {};

    for (const item of cart) {
      map[item.product.id] = item.quantity;
    }

    return map;
  }, [cart]);

  const cartTotalQuantity = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  function updateCart(nextCart: CartItem[]) {
    setCart(nextCart);
    writeCartToStorage(nextCart);
  }

  function getSelectedQuantity(productId: number) {
    return selectedQuantities[productId] ?? 1;
  }

  function getProductCartQuantity(productId: number) {
    return cartQuantities[productId] ?? 0;
  }

  function getRemainingStock(product: ProductListItem) {
    const currentStock = product.currentStock ?? 0;
    const cartQuantity = getProductCartQuantity(product.id);

    return Math.max(currentStock - cartQuantity, 0);
  }

  function increaseSelectedQuantity(productId: number) {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 1) + 1,
    }));
  }

  function decreaseSelectedQuantity(productId: number) {
    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] ?? 1) - 1, 1),
    }));
  }

  function addToSalesCart(product: ProductListItem, quantityToAdd?: number) {
    const currentStock = product.currentStock ?? 0;
    const currentCartQuantity = getProductCartQuantity(product.id);
    const remainingStock = Math.max(currentStock - currentCartQuantity, 0);
    const quantity = Math.max(quantityToAdd ?? getSelectedQuantity(product.id), 1);

    if (currentStock <= 0) {
        window.alert('Bu ürünün stokta kalmamıştır.');
        return;
    }
    
    if (quantity > remainingStock) {
        window.alert(`Bu üründen stokta sadece ${remainingStock} adet kalmıştır.`);
        return;
    }

    const existing = cart.find((item) => item.product.id === product.id);

    let nextCart: CartItem[] = [];

    if (existing) {
      nextCart = cart.map((item) => {
        if (item.product.id !== product.id) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + quantity,
        };
      });
    } else {
      nextCart = [
        ...cart,
        {
          product,
          quantity,
        },
      ];
    }

    updateCart(nextCart);

    setSelectedQuantities((prev) => ({
      ...prev,
      [product.id]: 1,
    }));
  }

  function increaseQuantity(productId: number) {
    const nextCart = cart.map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      const stock = item.product.currentStock ?? 0;
      const nextQuantity = Math.min(stock, item.quantity + 1);

      return {
        ...item,
        quantity: nextQuantity,
      };
    });

    updateCart(nextCart);
  }

  function decreaseQuantity(productId: number) {
    const nextCart = cart
      .map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      )
      .filter((item) => item.quantity > 0);

    updateCart(nextCart);
  }

  function removeItem(productId: number) {
    const nextCart = cart.filter((item) => item.product.id !== productId);
    updateCart(nextCart);
  }

  function clearCart(confirmBeforeClear = true) {
    if(confirmBeforeClear) {
      const confirmed = window.confirm('Sepetteki tüm ürünler kaldırılacak. Emin misiniz?');

      if (!confirmed) {
        return false;
      }
    }

    updateCart([]);

    return true;
  }

  return {
    cart,
    setCart,
    cartHydrated,

    cartQuantities,
    selectedQuantities,
    cartTotalQuantity,
    cartSubtotal,
    getSelectedQuantity,
    getProductCartQuantity,
    getRemainingStock,

    increaseSelectedQuantity,
    decreaseSelectedQuantity,
    addToSalesCart,

    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  };
}