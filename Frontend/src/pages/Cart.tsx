import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
  const { t } = useTranslation();

  if (cartItems.length === 0) {
    return (
      <div className="container-main py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto" />
        <h2 className="font-serif text-2xl font-bold mt-6">{t("yourCartIsEmpty")}</h2>
        <p className="text-muted-foreground mt-2">{t("cartEmptyDesc")}</p>
        <Link to="/products" className="inline-flex items-center gap-2 mt-6 bg-foreground text-background px-6 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
          {t("continueShopping")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">{t("shoppingCart")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <motion.div key={item.product._id} layout className="flex gap-4 p-4 border border-border rounded-sm">
              <Link to={`/products/${item.product._id}`} className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
                <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <Link to={`/products/${item.product._id}`} className="font-medium text-sm hover:underline line-clamp-1">{item.product.name}</Link>
                  <button onClick={() => removeFromCart(item.product._id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">${item.product.price}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-sm">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1.5 hover:bg-secondary transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-xs font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1.5 hover:bg-secondary transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-sm p-6 sticky top-24">
            <h3 className="font-semibold mb-4">{t("orderSummary")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t("subtotal")}</span><span>${getTotal().toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t("shipping")}</span><span>{getTotal() > 100 ? t("free") : "$9.99"}</span></div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-semibold text-base">
                <span>{t("total")}</span>
                <span>${(getTotal() + (getTotal() > 100 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="block w-full text-center mt-6 bg-foreground text-background py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
              {t("proceedToCheckout")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
