import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, Menu, X, LogOut, LayoutDashboard, Globe, Brain } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
];

const Navbar = () => {
  const { getItemCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-main flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-foreground">
          <img src="/android-chrome-192x192.png" alt="Ayurvedh logo" className="h-8 w-8 rounded-sm object-contain" />
          Ayurvedh
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("home")}
          </Link>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("about")}
          </Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("shop")}
          </Link>
          <Link to="/symptoms" className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-900 transition-colors">
            <Brain className="h-4 w-4" />
            {t("symptomChecker")}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <select
              value={i18n.language}
              onChange={handleLangChange}
              className="text-xs font-medium bg-transparent border-none outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/wishlist" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="h-5 w-5" />
            {getWishlistCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                {getWishlistCount()}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {getItemCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                {getItemCount()}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}
              <Link to="/profile" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <User className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-sm hover:opacity-90 transition-opacity">
              {t("signIn")}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-in">
          <div className="container-main py-4 flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{t("home")}</Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{t("shop")}</Link>
            <Link to="/symptoms" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm font-medium py-2 text-green-700">
              <Brain className="h-4 w-4" /> {t("symptomChecker")}
            </Link>
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{t("cart")} ({getItemCount()})</Link>
            <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{t("wishlist")} ({getWishlistCount()})</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{t("profile")}</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{t("admin")}</Link>}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-sm font-medium py-2 text-left text-destructive">{t("logout")}</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2">{t("signIn")}</Link>
            )}
            {/* Mobile Language Switcher */}
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                value={i18n.language}
                onChange={handleLangChange}
                className="text-sm font-medium bg-transparent border-none outline-none cursor-pointer text-foreground"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
