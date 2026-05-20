import { useCallback, useMemo, useState } from "react";
import type { CartItem, Product } from "../types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.preco * item.quantidade, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantidade, 0),
    [items]
  );

  const addProduct = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          nome: product.nome,
          preco: product.preco,
          quantidade: 1,
        },
      ];
    });
  }, []);

  const changeQuantity = useCallback((productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantidade: i.quantidade + delta }
            : i
        )
        .filter((i) => i.quantidade > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const setCartItems = useCallback((next: CartItem[]) => {
    setItems(next);
  }, []);

  return {
    items,
    total,
    itemCount,
    addProduct,
    changeQuantity,
    removeItem,
    clear,
    setCartItems,
  };
}
