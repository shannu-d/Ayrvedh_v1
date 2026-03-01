import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t } = useTranslation();

  if (wishlistItems.length === 0) {
    return (
      <div className="container-main py-20 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
        <h2 className="font-serif text-2xl font-bold mt-6">{t("wishlistEmpty")}</h2>
        <p className="text-muted-foreground mt-2">{t("wishlistEmptyDesc")}</p>
        <Link to="/products" className="inline-block mt-6 bg-foreground text-background px-6 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
          {t("browseProducts")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">{t("wishlist")}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((p) => (
          <div key={p._id} className="group">
            <Link to={`/products/${p._id}`} className="block">
              <div className="aspect-square overflow-hidden rounded-sm bg-secondary">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-sm font-medium mt-3 line-clamp-1">{p.name}</h3>
              <p className="text-sm font-semibold mt-1">₹{p.price}</p>
            </Link>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { addToCart(p); removeFromWishlist(p._id); toast.success(t("addedToCart")); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-foreground text-background py-2 rounded-sm text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> {t("moveToCart")}
              </button>
              <button
                onClick={() => { removeFromWishlist(p._id); toast(t("removedFromWishlist")); }}
                className="p-2 border border-border rounded-sm hover:bg-secondary transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
