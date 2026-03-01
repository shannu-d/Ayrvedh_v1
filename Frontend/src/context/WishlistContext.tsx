import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/services/mockData";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => (prev.find((p) => p._id === product._id) ? prev : [...prev, product]));
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((p) => p._id !== productId));
  };

  const isInWishlist = (productId: string) => wishlistItems.some((p) => p._id === productId);
  const getWishlistCount = () => wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
