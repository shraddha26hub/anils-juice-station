"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  decreaseQuantity: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] =
    useState(false);

  /*
   * ================================
   * LOAD CART FROM LOCAL STORAGE
   * ================================
   */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem("anils-cart");

      if (!savedCart) {
        setCartLoaded(true);
        return;
      }

      const parsedCart = JSON.parse(savedCart);

      /*
       * Make sure the stored value
       * is actually an array.
       */

      if (!Array.isArray(parsedCart)) {
        localStorage.removeItem("anils-cart");
        setCartLoaded(true);
        return;
      }

      /*
       * Validate every cart item.
       *
       * This protects the application
       * from corrupted localStorage data.
       */

      const validCart: CartItem[] =
        parsedCart.filter((item) => {
          return (
            item &&
            typeof item.id === "number" &&
            typeof item.name === "string" &&
            typeof item.price === "number" &&
            Number.isFinite(item.price) &&
            item.price >= 0 &&
            typeof item.quantity === "number" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            (
              item.image_url === null ||
              typeof item.image_url === "string"
            )
          );
        });

      setCart(validCart);
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );

      /*
       * If localStorage is corrupted,
       * start with an empty cart.
       */

      setCart([]);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  /*
   * ================================
   * SAVE CART TO LOCAL STORAGE
   * ================================
   */

  useEffect(() => {
    if (!cartLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        "anils-cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [cart, cartLoaded]);

  /*
   * ================================
   * ADD TO CART
   * ================================
   */

  function addToCart(
    product: Omit<CartItem, "quantity">
  ) {
    /*
     * Basic protection against
     * invalid product information.
     */

    if (
      !Number.isInteger(product.id) ||
      product.id <= 0
    ) {
      console.error(
        "Invalid product ID:",
        product.id
      );

      return;
    }

    if (
      typeof product.name !== "string" ||
      product.name.trim() === ""
    ) {
      console.error(
        "Invalid product name."
      );

      return;
    }

    if (
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price < 0
    ) {
      console.error(
        "Invalid product price:",
        product.price
      );

      return;
    }

    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      /*
       * Product already exists.
       * Increase quantity.
       */

      if (existingItem) {
        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item
        );
      }

      /*
       * New product.
       */

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  /*
   * ================================
   * REMOVE ITEM COMPLETELY
   * ================================
   */

  function removeFromCart(id: number) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  }

  /*
   * ================================
   * DECREASE QUANTITY
   * ================================
   */

  function decreaseQuantity(id: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }

  /*
   * ================================
   * CLEAR CART
   * ================================
   */

  function clearCart() {
    setCart([]);
  }

  /*
   * ================================
   * TOTAL NUMBER OF ITEMS
   * ================================
   */

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  /*
   * ================================
   * TOTAL CART PRICE
   * ================================
   */

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  /*
   * ================================
   * PROVIDER
   * ================================
   */

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
 * ================================
 * USE CART HOOK
 * ================================
 */

export function useCart() {
  const context =
    useContext(CartContext);

  if (context === null) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}