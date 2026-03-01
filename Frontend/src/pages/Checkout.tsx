import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orderApi } from "@/services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Checkout = () => {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: user?.name || "", address: "", city: "", postalCode: "", country: "" });
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderApi.create({ items: cartItems, total: getTotal(), shippingAddress: form });
      clearCart();
      toast.success("Order placed!");
      navigate("/order-success");
    } catch {
      toast.error("Failed to place order");
    }
    setLoading(false);
  };

  const shipping = getTotal() > 100 ? 0 : 9.99;

  return (
    <div className="container-main py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">{t("checkout")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg mb-2">{t("shippingAddress")}</h2>
          {(["fullName", "address", "city", "postalCode", "country"] as const).map((field) => (
            <div key={field}>
              <label className="text-sm font-medium mb-1.5 block capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <input
                type="text"
                required
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}
          <button type="submit" disabled={loading || cartItems.length === 0}
            className="w-full bg-foreground text-background py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-4">
            {loading ? t("placingOrder") : `${t("placeOrder")} — $${(getTotal() + shipping).toFixed(2)}`}
          </button>
        </form>

        <div className="border border-border rounded-sm p-6 h-fit sticky top-24">
          <h3 className="font-semibold mb-4">{t("orderSummary")}</h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("subtotal")}</span><span>${getTotal().toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("shipping")}</span><span>{shipping === 0 ? t("free") : `$${shipping}`}</span></div>
              <div className="flex justify-between font-semibold"><span>{t("total")}</span><span>${(getTotal() + shipping).toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
