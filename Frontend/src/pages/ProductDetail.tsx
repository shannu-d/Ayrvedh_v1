import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingCart, Minus, Plus, ArrowLeft, Package, ShieldCheck, FlaskConical, Leaf, ExternalLink, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { productApi } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type Tab = "overview" | "properties" | "benefits" | "usage" | "science";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [herb, setHerb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const { t, i18n } = useTranslation();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      setLoading(true);
      productApi.getById(id, i18n.language).then((data: any) => {
        setProduct(data.product || data);
        setHerb(data.herb || null);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id, i18n.language]); // re-fetch whenever language changes

  const requireLogin = (action: () => void) => {
    if (!user) {
      toast.error(t("pleaseLogin"), {
        action: { label: t("loginAction"), onClick: () => navigate("/login") },
      });
      return;
    }
    action();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!product) return (
    <div className="container-main py-20 text-center">
      <p className="text-lg text-muted-foreground">{t("productNotFound")}</p>
    </div>
  );

  const wishlisted = isInWishlist(product._id);
  const images = (product.images?.length > 0 ? product.images : [product.image]).filter(Boolean);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("tabOverview") },
    { key: "properties", label: t("tabProperties") },
    { key: "benefits", label: t("tabBenefits") },
    { key: "usage", label: t("tabUsage") },
    ...(herb?.researchBadge ? [{ key: "science" as Tab, label: t("tabScience") }] : []),
  ];

  const TRUST_BADGES = [
    { icon: ShieldCheck, label: t("gmpCertified") },
    { icon: FlaskConical, label: t("labTested") },
    { icon: Leaf, label: t("naturalProduct") },
  ];

  const stockStatus = product.stock > 5
    ? t("inStock")
    : product.stock > 0
      ? t("onlyLeft", { count: product.stock })
      : t("outOfStock");

  return (
    <div className="container-main py-8 max-w-6xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </button>

      {/* ── TOP SECTION ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {/* Images */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary border border-border">
            <img src={images[selectedImage] || images[0]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-foreground" : "border-transparent"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex flex-col gap-3">
          {/* Category badges */}
          <div className="flex flex-wrap gap-2">
            {(herb?.category || [product.category]).map((cat: string) => (
              <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">{cat}</span>
            ))}
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>

          {/* Research badge */}
          {herb?.researchBadge && (
            <div className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold w-fit">
              <FlaskConical className="h-3.5 w-3.5" /> {t("researchBacked")}
            </div>
          )}

          {/* Translated content badge */}
          {herb?._translatedLang && herb._translatedLang !== 'en' && (
            <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold w-fit">
              <Globe className="h-3.5 w-3.5" /> {t("translatedContent")}
            </div>
          )}

          {/* Scientific name */}
          {herb?.botanicalName && (
            <p className="text-sm italic text-muted-foreground">{herb.botanicalName}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.rating} ({product.numReviews} {t("reviews")})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
            {product.originalPrice && (
              <span className="text-sm text-green-700 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% off
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className={`text-sm font-medium ${product.stock > 5 ? "text-green-700" : product.stock > 0 ? "text-amber-600" : "text-destructive"}`}>
              {stockStatus}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 hover:bg-secondary transition-colors">
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2.5 hover:bg-secondary transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => requireLogin(() => { addToCart(product, quantity); toast.success(t("addedToCart")); })}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3.5 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              {user ? t("addToCart") : t("loginToAdd")}
            </button>
            <button
              onClick={() => requireLogin(() => { wishlisted ? removeFromWishlist(product._id) : addToWishlist(product); toast(wishlisted ? t("removedFromWishlist") : t("addedToWishlist")); })}
              title={t("wishlist")}
              className={`p-3.5 border-2 rounded-md transition-colors ${wishlisted && user ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary"}`}
            >
              <Heart className={`h-5 w-5 ${wishlisted && user ? "fill-primary" : ""}`} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border mt-2">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-green-700" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── TABS + CONTENT ─────────────────────────── */}
      {herb && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tab bar */}
            <div className="flex border-b border-border mb-6 gap-0 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${activeTab === tab.key
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview — Botanical Information */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-serif text-xl font-bold mb-4">{t("botanicalInfo")}</h2>
                <table className="w-full text-sm border border-border rounded-md overflow-hidden">
                  <tbody>
                    {[
                      ["Botanical Name", herb.botanicalName],
                      ["Family", herb.family],
                      ["Sanskrit Names", herb.sanskritName],
                      ["English Name", herb.englishName],
                      ["Other Names", herb.otherNames?.join(", ")],
                      ["Parts Used", herb.partUsed?.join(", ")],
                      ["Geographic Origin", herb.geographicOrigin],
                    ].filter(([, v]) => v).map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? "bg-secondary/30" : "bg-background"}>
                        <td className="px-4 py-3 font-medium text-muted-foreground w-2/5">{label}</td>
                        <td className="px-4 py-3">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Tab: Ayurvedic Properties */}
            {activeTab === "properties" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-serif text-xl font-bold mb-4">{t("ayurvedicProperties")}</h2>
                <table className="w-full text-sm border border-border rounded-md overflow-hidden">
                  <tbody>
                    {[
                      ["Rasa (Taste)", herb.taste?.join(", ")],
                      ["Guna (Quality)", herb.guna?.join(", ")],
                      ["Virya (Potency)", herb.energy],
                      ["Vipaka (Post-digestive effect)", herb.vipaka],
                      ["Dosha Effect", `Balances ${herb.dosha?.join(" & ")}`],
                    ].filter(([, v]) => v).map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? "bg-secondary/30" : "bg-background"}>
                        <td className="px-4 py-3 font-medium text-muted-foreground w-2/5">{label}</td>
                        <td className="px-4 py-3">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* Tab: Benefits */}
            {activeTab === "benefits" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h2 className="font-serif text-xl font-bold">{t("healthBenefits")}</h2>
                {herb.healthBenefitGroups?.length > 0 ? (
                  herb.healthBenefitGroups.map((g: any) => (
                    <div key={g.groupName} className="border border-border rounded-md overflow-hidden">
                      <div className="bg-secondary/50 px-4 py-2.5">
                        <h3 className="font-semibold text-sm">{g.groupName}</h3>
                      </div>
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        <span className="text-foreground">•</span> {g.detail}
                      </div>
                    </div>
                  ))
                ) : (
                  <ul className="space-y-2">
                    {herb.benefits?.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-700 mt-0.5 flex-shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {/* Tab: Usage & Safety */}
            {activeTab === "usage" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold mb-3">{t("dosageAndForms")}</h2>
                  {herb.dosageForms?.length > 0 ? (
                    <table className="w-full text-sm border border-border rounded-md overflow-hidden">
                      <tbody>
                        {herb.dosageForms.map((d: any, i: number) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-secondary/30" : "bg-background"}>
                            <td className="px-4 py-3 font-medium w-1/3">{d.form}</td>
                            <td className="px-4 py-3 text-muted-foreground">{d.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-muted-foreground">{herb.dosage}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3 italic">{t("consultPractitioner")}</p>
                </div>

                <div>
                  <h2 className="font-serif text-xl font-bold mb-3">{t("precautions")}</h2>
                  <ul className="space-y-1.5">
                    {herb.precautions?.map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 flex-shrink-0 mt-0.5">◦</span>
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Tab: Science (Layer 3 — Scientific Validation) */}
            {activeTab === "science" && herb?.researchBadge && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <FlaskConical className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    This herb has <strong>peer-reviewed scientific research</strong> supporting its Ayurvedic uses.
                  </p>
                </div>

                {herb.activeCompounds?.length > 0 && (
                  <div>
                    <h2 className="font-serif text-xl font-bold mb-3">{t("activeCompounds")}</h2>
                    <p className="text-sm text-muted-foreground mb-3">Key bioactive molecules scientifically identified in this herb:</p>
                    <div className="flex flex-wrap gap-2">
                      {herb.activeCompounds.map((compound: string) => (
                        <span key={compound}
                          className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-sm font-medium">
                          🔬 {compound}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {herb.pubmedLinks?.length > 0 && (
                  <div>
                    <h2 className="font-serif text-xl font-bold mb-3">{t("researchRefs")}</h2>
                    <p className="text-sm text-muted-foreground mb-3">Peer-reviewed studies from PubMed / national research databases:</p>
                    <div className="space-y-2">
                      {herb.pubmedLinks.map((link: string, i: number) => (
                        <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline p-3 border border-blue-100 rounded-lg bg-blue-50/50 transition-colors">
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          <span>PubMed Reference {i + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground border-t border-border pt-4 italic">
                  ⚕️ Scientific evidence supports traditional use. Always consult a qualified practitioner before starting any herbal regimen.
                </p>
              </motion.div>
            )}
          </div>

          {/* ── SIDEBAR ──────────────────────────────── */}
          <div className="space-y-5">
            {/* Usage & Dosage */}
            {herb.dosageForms?.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">{t("usageAndDosage")}</h3>
                <div className="space-y-2">
                  {herb.dosageForms.map((d: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="font-medium w-20 flex-shrink-0 text-foreground">{d.form}</span>
                      <span className="text-muted-foreground">{d.amount}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic border-t border-border pt-2">{t("consultPractitioner")}</p>
              </div>
            )}

            {/* Indications */}
            {herb.indications?.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">{t("indications")}</h3>
                <ul className="space-y-1.5">
                  {herb.indications.map((ind: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-green-700 mt-0.5 flex-shrink-0">◦</span>
                      {ind}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contraindications */}
            {herb.contraindications?.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">{t("contraindications")}</h3>
                <ul className="space-y-1.5">
                  {herb.contraindications.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-amber-600 flex-shrink-0 mt-0.5">◦</span>
                      {c}
                    </li>
                  ))}
                  {herb.precautions?.slice(0, 2).map((p: string, i: number) => (
                    <li key={`p${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-amber-600 flex-shrink-0 mt-0.5">◦</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Storage */}
            {herb.storageInstructions?.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">{t("storageInstructions")}</h3>
                <ul className="space-y-1.5">
                  {herb.storageInstructions.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-foreground flex-shrink-0 mt-0.5">◦</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
