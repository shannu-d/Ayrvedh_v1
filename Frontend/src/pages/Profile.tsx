import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { orderApi } from "@/services/api";
import { Order } from "@/services/mockData";
import { LogOut, User, Lock, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState(user?.name || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    orderApi.getMyOrders().then(setOrders);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(name.trim());
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password");
    }
    setChangingPassword(false);
  };

  return (
    <div className="container-main py-10">
      <h1 className="font-serif text-3xl font-bold mb-8">{t("myAccount")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar card */}
          <div className="border border-border rounded-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.role === "admin" && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t("admin")}</span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border border-border py-2.5 rounded-sm text-sm font-medium hover:bg-secondary transition-colors"
            >
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </div>

          {/* Edit Name */}
          <form onSubmit={handleSaveProfile} className="border border-border rounded-sm p-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{t("editName")}</h3>
            </div>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder={t("yourName")}
            />
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {savingProfile ? t("saving") : t("saveName")}
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="border border-border rounded-sm p-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{t("changePassword")}</h3>
            </div>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder={t("currentPassword")}
            />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder={t("newPassword")}
            />
            <button
              type="submit"
              disabled={changingPassword}
              className="w-full bg-foreground text-background py-2.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {changingPassword ? t("updating") : t("updatePassword")}
            </button>
          </form>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-lg mb-4">{t("orderHistory")}</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noOrdersYet")}</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-border rounded-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-medium">{t("order")}{order._id}</p>
                      <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${order.status === "Delivered" ? "bg-brand-olive/10 text-brand-olive" :
                      order.status === "Shipped" ? "bg-brand-warm/10 text-brand-warm" :
                        "bg-secondary text-foreground"
                      }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.items.map((item) => (
                      <div key={item.product._id} className="h-12 w-12 rounded-sm overflow-hidden bg-secondary">
                        <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    <span className="ml-auto text-sm font-semibold">₹{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
