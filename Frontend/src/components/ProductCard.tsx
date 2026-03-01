import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/services/mockData";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const wishlisted = isInWishlist(product._id);

  const requireLogin = (action: () => void) => {
    if (!user) {
      toast.error(t("pleaseLogin"), {
        action: { label: t("loginAction"), onClick: () => navigate("/login") },
      });
      return;
    }
    action();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireLogin(() => {
      if (wishlisted) {
        removeFromWishlist(product._id);
        toast(t("removedFromWishlist"));
      } else {
        addToWishlist(product);
        toast.success(t("addedToWishlist"));
      }
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireLogin(() => {
      addToCart(product);
      toast.success(t("addedToCart"));
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/products/${product._id}`} className="group block">
        <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            title={user ? (wishlisted ? t("removedFromWishlist") : t("addedToWishlist")) : t("pleaseLogin")}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart className={`h-4 w-4 ${wishlisted && user ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            title={user ? t("addedToCart") : t("pleaseLogin")}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-90"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>

          {product.originalPrice && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-sm">
              {t("sale")}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-brand-gold text-brand-gold" />
            <span className="text-xs text-muted-foreground">{product.rating} ({product.numReviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
