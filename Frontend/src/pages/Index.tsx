import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { productApi } from "@/services/api";
import { Product, categories } from "@/services/mockData";
import ProductCard from "@/components/ProductCard";
import heroImage from "@/assets/hero-image.jpg";
import { useTranslation } from "react-i18next";

const Home = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    productApi.getFeatured().then(setFeatured);
  }, []);

  const features = [
    { icon: Truck, label: t("freeShipping"), desc: t("freeShippingDesc") },
    { icon: Shield, label: t("securePayment"), desc: t("securePaymentDesc") },
    { icon: RotateCcw, label: t("easyReturns"), desc: t("easyReturnsDesc") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Hero" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-foreground/20" />
        </div>
        <div className="container-main relative z-10 flex items-left gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 8, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <span className="text-primary-foreground/80 text-sm uppercase tracking-[0.3em] font-medium">{t("newCollection")}</span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary-foreground mt-4 leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-primary-foreground/80 mt-6 text-lg max-w-md">
              {t("heroSubtitle")}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 mt-8 bg-background text-foreground px-8 py-3.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("shopNow")} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="container-main py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3 justify-center py-2">
              <f.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-main py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">{t("shopByCategory")}</h2>
          <p className="text-muted-foreground mt-2">{t("shopByCategoryDesc")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="group flex flex-col items-center gap-3 p-6 rounded-sm bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-main pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">{t("newArrivals")}</h2>
            <p className="text-muted-foreground mt-2">{t("mostLoved")}</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            {t("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-main pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">{t("featuredProducts")}</h2>
            <p className="text-muted-foreground mt-2">{t("mostLoved")}</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            {t("viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
