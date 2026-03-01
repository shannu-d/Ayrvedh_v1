import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/services/mockData";
import { useAuth } from "@/context/AuthContext";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // Storage key is scoped to the logged-in user's ID.
  // When user is null (logged out), key is null so nothing is read/written.
  const storageKey = user ? `cart_${user._id}` : null;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Reload the correct cart whenever the user changes (login / logout / switch account)
  useEffect(() => {
    if (!storageKey) {
      // Logged out — clear in-memory cart (do NOT touch any user-specific localStorage key)
      setCartItems([]);
      return;
    }
    // Logged in — load this user's persisted cart
    const saved = localStorage.getItem(storageKey);
    setCartItems(saved ? JSON.parse(saved) : []);
  }, [storageKey]);

  // Persist to this user's key on every change (only when logged in)
  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(cartItems));
  }, [cartItems, storageKey]);

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCartItems((prev) =>
      prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
    );
  };

  const getTotal = () => cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const getItemCount = () => cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const clearCart = () => {
    setCartItems([]);
    if (storageKey) localStorage.removeItem(storageKey);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, getTotal, getItemCount, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
