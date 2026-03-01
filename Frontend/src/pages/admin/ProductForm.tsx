import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, X, Image as ImageIcon } from "lucide-react";
import { adminApi, productApi } from "@/services/api";
import { toast } from "sonner";

const DEFAULT_CATEGORIES = ["Anti-Bacterial", "Anti-Cancer", "Anti-Viral", "Anti-Oxidant", "Immunity", "Digestive", "Skin Care", "Detox", "Adaptogen", "Respiratory", "Brain Tonic", "Women's Health", "Anti-Inflammatory", "Energy"];
const TASTE_OPTIONS = ["Sweet", "Sour", "Salty", "Pungent", "Bitter", "Astringent", "Amla (sour)", "Kashaya (astringent)"];
const GUNA_OPTIONS = ["Light", "Heavy", "Dry", "Oily", "Sharp", "Dull", "Hot", "Cold", "Rough", "Smooth"];
const DOSHA_OPTIONS = ["Vata", "Pitta", "Kapha"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="border-b border-border pb-3 mb-5">
    <h2 className="font-semibold text-base">{title}</h2>
    {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
  </div>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="text-sm font-medium mb-1.5 block">{label}{required && " *"}</label>
    {children}
  </div>
);

const inputClass = "w-full px-3 py-2.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring";
const textareaClass = `${inputClass} resize-none`;

// ─── Multi-value list editor (tags input) ─────────────────────────────────────
const TagsInput = ({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) => {
  const [draft, setDraft] = useState("");
  const add = () => { const t = draft.trim(); if (t && !values.includes(t)) { onChange([...values, t]); } setDraft(""); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder || "Type and press Enter"} className={`${inputClass} flex-1`} />
        <button type="button" onClick={add} className="px-3 py-2 border border-border rounded-md text-sm hover:bg-secondary transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-secondary px-2.5 py-1 rounded-full">
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Dynamic key-value pair editor ───────────────────────────────────────────
const PairsInput = ({ values, onChange, keyLabel, valueLabel }: { values: { form?: string; groupName?: string; amount?: string; detail?: string }[]; onChange: (v: any[]) => void; keyLabel: string; valueLabel: string }) => {
  const keyField = keyLabel === "Form" ? "form" : "groupName";
  const valField = keyLabel === "Form" ? "amount" : "detail";
  return (
    <div className="space-y-2">
      {values.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input value={(item as any)[keyField] || ""} onChange={e => { const upd = [...values]; (upd[i] as any)[keyField] = e.target.value; onChange(upd); }}
            placeholder={keyLabel} className={`${inputClass} w-32 flex-shrink-0`} />
          <input value={(item as any)[valField] || ""} onChange={e => { const upd = [...values]; (upd[i] as any)[valField] = e.target.value; onChange(upd); }}
            placeholder={valueLabel} className={`${inputClass} flex-1`} />
          <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="mt-2.5 hover:text-destructive flex-shrink-0"><X className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...values, { [keyField]: "", [valField]: "" }])}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <Plus className="h-3.5 w-3.5" /> Add {keyLabel}
      </button>
    </div>
  );
};

// ─── Checkbox multi-select ────────────────────────────────────────────────────
const CheckboxGroup = ({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <label key={opt} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${values.includes(opt) ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}>
        <input type="checkbox" className="sr-only" checked={values.includes(opt)}
          onChange={e => onChange(e.target.checked ? [...values, opt] : values.filter(v => v !== opt))} />
        {opt}
      </label>
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // ── Product fields ──────────────────────────────────────────────────────────
  const [product, setProduct] = useState({
    name: "", price: "", originalPrice: "", description: "",
    category: DEFAULT_CATEGORIES[0], stock: "", featured: false,
  });

  // ── Image fields ────────────────────────────────────────────────────────────
  const [primaryImage, setPrimaryImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [imgDraft, setImgDraft] = useState("");

  // ── Herb: Botanical ─────────────────────────────────────────────────────────
  const [botanical, setBotanical] = useState({
    botanicalName: "", englishName: "", sanskritName: "",
    family: "", geographicOrigin: "", otherNames: [] as string[],
    partUsed: [] as string[],
  });

  // ── Herb: Ayurvedic properties ─────────────────────────────────────────────
  const [properties, setProperties] = useState({
    taste: [] as string[], guna: [] as string[],
    energy: "", vipaka: "", dosha: [] as string[],
  });

  // ── Herb: Clinical ─────────────────────────────────────────────────────────
  const [clinical, setClinical] = useState({
    description: "",
    benefits: [] as string[],
    healthBenefitGroups: [] as { groupName: string; detail: string }[],
    dosageForms: [] as { form: string; amount: string }[],
    indications: [] as string[],
    precautions: [] as string[],
    contraindications: [] as string[],
    storageInstructions: [] as string[],
  });

  // ── Herb: Translations (Layer 4) ────────────────────────────────────────────
  const [translations, setTranslations] = useState<Record<string, any>>({
    te: { description: "", benefits: [], uses: [], indications: [], healthBenefitGroups: [] },
    hi: { description: "", benefits: [], uses: [], indications: [], healthBenefitGroups: [] },
    ta: { description: "", benefits: [], uses: [], indications: [], healthBenefitGroups: [] },
    ml: { description: "", benefits: [], uses: [], indications: [], healthBenefitGroups: [] },
  });

  const updateTrans = (lang: string, field: string, val: any) => {
    setTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: val } }));
  };

  // ── Load data in edit mode ─────────────────────────────────────────────────
  useEffect(() => {
    productApi.getCategories().then((cats: string[]) => { if (cats.length > 0) setCategories(cats); }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const data: any = await productApi.getById(id!);
        const p = data.product || data;
        const h = data.herb || null;
        setProduct({ name: p.name, price: String(p.price), originalPrice: String(p.originalPrice || ""), description: p.description, category: p.category, stock: String(p.stock), featured: p.featured || false });
        setPrimaryImage(p.image || "");
        setAdditionalImages(p.images?.filter((img: string) => img !== p.image) || []);
        if (h) {
          setBotanical({ botanicalName: h.botanicalName || "", englishName: h.englishName || "", sanskritName: h.sanskritName || "", family: h.family || "", geographicOrigin: h.geographicOrigin || "", otherNames: h.otherNames || [], partUsed: h.partUsed || [] });
          setProperties({ taste: h.taste || [], guna: h.guna || [], energy: h.energy || "", vipaka: h.vipaka || "", dosha: h.dosha || [] });
          setClinical({ description: h.description || "", benefits: h.benefits || [], healthBenefitGroups: h.healthBenefitGroups || [], dosageForms: h.dosageForms || [], indications: h.indications || [], precautions: h.precautions || [], contraindications: h.contraindications || [], storageInstructions: h.storageInstructions || [] });
          if (h.translations) {
            setTranslations(prev => ({ ...prev, ...h.translations }));
          }
        }
      } catch { toast.error("Failed to load product"); navigate("/admin/products"); }
      setLoading(false);
    };
    load();
  }, [id, isEdit, navigate]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const allImages = [primaryImage, ...additionalImages].filter(Boolean);
    const data = {
      name: product.name.trim(),
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      description: product.description.trim(),
      category: product.category,
      image: primaryImage.trim(),
      images: allImages,
      stock: Number(product.stock),
      featured: product.featured,
      herb: {
        name: product.name.trim(),
        ...botanical,
        category: [product.category],
        description: clinical.description || product.description.trim(),
        ...properties,
        ...clinical,
        translations: translations,
      },
    };
    try {
      if (isEdit) { await adminApi.updateProduct(id!, data); toast.success("Product updated"); }
      else { await adminApi.addProduct(data); toast.success("Product added"); }
      navigate("/admin/products");
    } catch (err: any) { toast.error(err?.message || "Failed to save product"); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const sections = ["Basic Info", "Images", "Botanical", "Ayurvedic", "Benefits & Dosage", "Clinical", "Translations"];

  return (
    <div className="container-main py-10 max-w-3xl">
      <Link to="/admin/products" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>
      <h1 className="font-serif text-3xl font-bold mb-2">{isEdit ? "Edit Product" : "Add New Product"}</h1>
      <p className="text-sm text-muted-foreground mb-8">Fill in the product details and Ayurvedic herb information</p>

      {/* Section nav tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
        {sections.map((s, i) => (
          <button key={s} type="button" onClick={() => setActiveSection(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${activeSection === i ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── SECTION 1: Basic Info ──────────────────────────────────── */}
        {activeSection === 0 && (
          <div className="space-y-4">
            <SectionHeader title="Basic Product Information" subtitle="Core details that appear on the product card and listing" />
            <Field label="Product Name" required>
              <input type="text" required value={product.name} onChange={e => setProduct({ ...product, name: e.target.value })} className={inputClass} placeholder="e.g. Ashwagandha Root Extract" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Selling Price (₹)" required>
                <input type="number" required min={0} value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })} className={inputClass} placeholder="299" />
              </Field>
              <Field label="Original Price (₹)">
                <input type="number" min={0} value={product.originalPrice} onChange={e => setProduct({ ...product, originalPrice: e.target.value })} className={inputClass} placeholder="399 (shows strikethrough)" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <select value={product.category} onChange={e => setProduct({ ...product, category: e.target.value })} className={inputClass}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Stock Quantity" required>
                <input type="number" required min={0} value={product.stock} onChange={e => setProduct({ ...product, stock: e.target.value })} className={inputClass} placeholder="50" />
              </Field>
            </div>
            <Field label="Short Description" required>
              <textarea required rows={3} value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })} className={textareaClass} placeholder="A brief description shown on the product card..." />
            </Field>
            <div className="flex items-center gap-3 p-3 border border-border rounded-md">
              <input type="checkbox" id="featured" checked={product.featured} onChange={e => setProduct({ ...product, featured: e.target.checked })} className="h-4 w-4 rounded" />
              <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Feature on Homepage</label>
            </div>
          </div>
        )}

        {/* ── SECTION 2: Images ─────────────────────────────────────── */}
        {activeSection === 1 && (
          <div className="space-y-5">
            <SectionHeader title="Product Images" subtitle="Paste image URLs — use Unsplash, your image host, or any public image link" />

            {/* Primary Image */}
            <Field label="Primary Image URL" required>
              <div className="flex gap-2">
                <input type="url" value={primaryImage} onChange={e => setPrimaryImage(e.target.value)} className={`${inputClass} flex-1`} placeholder="https://images.unsplash.com/..." />
                <span className="flex items-center px-3 border border-border rounded-md text-muted-foreground"><ImageIcon className="h-4 w-4" /></span>
              </div>
              {primaryImage && (
                <div className="mt-3 relative w-32 h-32">
                  <img src={primaryImage} alt="Primary preview" className="w-full h-full object-cover rounded-md border border-border" onError={e => (e.currentTarget.style.display = "none")} />
                  <button type="button" onClick={() => setPrimaryImage("")} className="absolute top-1 right-1 bg-background rounded-full p-0.5 border border-border hover:bg-destructive hover:text-white hover:border-destructive transition-colors"><X className="h-3 w-3" /></button>
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Primary</span>
                </div>
              )}
            </Field>

            {/* Additional Images */}
            <Field label="Additional Images">
              <div className="flex gap-2 mb-3">
                <input type="url" value={imgDraft} onChange={e => setImgDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (imgDraft.trim()) { setAdditionalImages(prev => [...prev, imgDraft.trim()]); setImgDraft(""); } } }}
                  className={`${inputClass} flex-1`} placeholder="Paste another image URL and press Enter" />
                <button type="button" onClick={() => { if (imgDraft.trim()) { setAdditionalImages(prev => [...prev, imgDraft.trim()]); setImgDraft(""); } }}
                  className="px-3 py-2 border border-border rounded-md hover:bg-secondary transition-colors"><Plus className="h-4 w-4" /></button>
              </div>
              {additionalImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {additionalImages.map((img, i) => (
                    <div key={i} className="relative w-24 h-24">
                      <img src={img} alt={`Image ${i + 2}`} className="w-full h-full object-cover rounded-md border border-border" onError={e => (e.currentTarget.style.display = "none")} />
                      <button type="button" onClick={() => setAdditionalImages(prev => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-background rounded-full p-0.5 border border-border hover:bg-destructive hover:text-white hover:border-destructive transition-colors"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">💡 Find free herb images at <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline">unsplash.com</a> — search for the herb name and copy image URL</p>
            </Field>
          </div>
        )}

        {/* ── SECTION 3: Botanical Info ──────────────────────────────── */}
        {activeSection === 2 && (
          <div className="space-y-4">
            <SectionHeader title="Botanical Information" subtitle="Shown in the Overview tab on the product detail page" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Botanical Name">
                <input value={botanical.botanicalName} onChange={e => setBotanical({ ...botanical, botanicalName: e.target.value })} className={inputClass} placeholder="e.g. Withania somnifera" />
              </Field>
              <Field label="English Name">
                <input value={botanical.englishName} onChange={e => setBotanical({ ...botanical, englishName: e.target.value })} className={inputClass} placeholder="e.g. Indian Winter Cherry" />
              </Field>
              <Field label="Sanskrit Name">
                <input value={botanical.sanskritName} onChange={e => setBotanical({ ...botanical, sanskritName: e.target.value })} className={inputClass} placeholder="e.g. Ashwagandha" />
              </Field>
              <Field label="Plant Family">
                <input value={botanical.family} onChange={e => setBotanical({ ...botanical, family: e.target.value })} className={inputClass} placeholder="e.g. Solanaceae" />
              </Field>
            </div>
            <Field label="Geographic Origin">
              <input value={botanical.geographicOrigin} onChange={e => setBotanical({ ...botanical, geographicOrigin: e.target.value })} className={inputClass} placeholder="e.g. Native to India, North Africa, Mediterranean" />
            </Field>
            <Field label="Other Names (brand & trade names, synonyms)">
              <TagsInput values={botanical.otherNames} onChange={v => setBotanical({ ...botanical, otherNames: v })} placeholder="e.g. Indian Ginseng" />
            </Field>
            <Field label="Parts Used">
              <TagsInput values={botanical.partUsed} onChange={v => setBotanical({ ...botanical, partUsed: v })} placeholder="e.g. Root" />
            </Field>
          </div>
        )}

        {/* ── SECTION 4: Ayurvedic Properties ───────────────────────── */}
        {activeSection === 3 && (
          <div className="space-y-5">
            <SectionHeader title="Ayurvedic Properties" subtitle="Shown in the 'Ayurvedic Properties' tab. These are traditional classifications." />
            <Field label="Rasa — Taste">
              <CheckboxGroup options={TASTE_OPTIONS} values={properties.taste} onChange={v => setProperties({ ...properties, taste: v })} />
            </Field>
            <Field label="Guna — Quality">
              <CheckboxGroup options={GUNA_OPTIONS} values={properties.guna} onChange={v => setProperties({ ...properties, guna: v })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Virya — Energy (Potency)">
                <select value={properties.energy} onChange={e => setProperties({ ...properties, energy: e.target.value })} className={inputClass}>
                  <option value="">Select…</option>
                  <option>Hot</option>
                  <option>Cold</option>
                  <option>Neutral</option>
                </select>
              </Field>
              <Field label="Vipaka — Post-digestive effect">
                <select value={properties.vipaka} onChange={e => setProperties({ ...properties, vipaka: e.target.value })} className={inputClass}>
                  <option value="">Select…</option>
                  <option>Sweet</option>
                  <option>Sour</option>
                  <option>Pungent</option>
                </select>
              </Field>
            </div>
            <Field label="Dosha — Balances which doshas?">
              <CheckboxGroup options={DOSHA_OPTIONS} values={properties.dosha} onChange={v => setProperties({ ...properties, dosha: v })} />
            </Field>
          </div>
        )}

        {/* ── SECTION 5: Benefits & Dosage ───────────────────────────── */}
        {activeSection === 4 && (
          <div className="space-y-5">
            <SectionHeader title="Benefits & Dosage" subtitle="Shown in the Benefits and Usage tabs on the product page" />
            <Field label="Full Description (for herb encyclopedia, can be longer)">
              <textarea rows={4} value={clinical.description} onChange={e => setClinical({ ...clinical, description: e.target.value })} className={textareaClass} placeholder="Detailed description of the herb..." />
            </Field>
            <Field label="Key Benefits (bullet list)">
              <TagsInput values={clinical.benefits} onChange={v => setClinical({ ...clinical, benefits: v })} placeholder="e.g. Reduces cortisol and stress" />
            </Field>
            <Field label="Health Benefit Groups (shown as expandable cards)">
              <PairsInput values={clinical.healthBenefitGroups} onChange={v => setClinical({ ...clinical, healthBenefitGroups: v })} keyLabel="Group" valueLabel="Detail" />
            </Field>
            <Field label="Dosage by Form">
              <PairsInput values={clinical.dosageForms} onChange={v => setClinical({ ...clinical, dosageForms: v })} keyLabel="Form" valueLabel="Amount" />
            </Field>
          </div>
        )}

        {/* ── SECTION 6: Clinical ─────────────────────────────────────── */}
        {activeSection === 5 && (
          <div className="space-y-5">
            <SectionHeader title="Clinical Information" subtitle="Shown in the sidebar on the product detail page" />
            <Field label="Indications (conditions it helps with)">
              <TagsInput values={clinical.indications} onChange={v => setClinical({ ...clinical, indications: v })} placeholder="e.g. Chronic fatigue" />
            </Field>
            <Field label="Precautions">
              <TagsInput values={clinical.precautions} onChange={v => setClinical({ ...clinical, precautions: v })} placeholder="e.g. Avoid before driving" />
            </Field>
            <Field label="Contraindications (who should NOT use this)">
              <TagsInput values={clinical.contraindications} onChange={v => setClinical({ ...clinical, contraindications: v })} placeholder="e.g. Pregnant women" />
            </Field>
            <Field label="Storage Instructions">
              <TagsInput values={clinical.storageInstructions} onChange={v => setClinical({ ...clinical, storageInstructions: v })} placeholder="e.g. Store in cool dry place" />
            </Field>
          </div>
        )}

        {/* ── SECTION 7: Translations ─────────────────────────────────── */}
        {activeSection === 6 && (
          <div className="space-y-8">
            <SectionHeader title="Multilingual Translations" subtitle="Add content in regional languages for the herb encyclopedia" />

            {["te", "hi", "ta", "ml"].map(lang => {
              const langName = lang === "te" ? "Telugu" : lang === "hi" ? "Hindi" : lang === "ta" ? "Tamil" : "Malayalam";
              return (
                <div key={lang} className="p-4 border border-border rounded-md bg-secondary/10">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-olive text-white flex items-center justify-center text-[10px] uppercase font-bold">{lang}</span>
                    {langName} Content
                  </h3>
                  <div className="space-y-4">
                    <Field label={`${langName} Description`}>
                      <textarea rows={3} value={translations[lang].description} onChange={e => updateTrans(lang, "description", e.target.value)} className={textareaClass} placeholder={`Description in ${langName}...`} />
                    </Field>
                    <Field label={`${langName} Benefits`}>
                      <TagsInput values={translations[lang].benefits} onChange={v => updateTrans(lang, "benefits", v)} placeholder={`Add benefit in ${langName}...`} />
                    </Field>
                    <Field label={`${langName} Health Benefit Groups`}>
                      <PairsInput values={translations[lang].healthBenefitGroups} onChange={v => updateTrans(lang, "healthBenefitGroups", v)} keyLabel="Group (Local)" valueLabel="Detail (Local)" />
                    </Field>
                    <Field label={`${langName} Usage & Indications`}>
                      <TagsInput values={translations[lang].uses} onChange={v => updateTrans(lang, "uses", v)} placeholder={`Add usage in ${langName}...`} />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Navigation + Submit ────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button type="button" onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors disabled:opacity-30">
            ← Previous
          </button>

          {activeSection < sections.length - 1 ? (
            <button type="button" onClick={() => setActiveSection(activeSection + 1)}
              className="px-4 py-2 text-sm bg-secondary border border-border rounded-md hover:bg-border transition-colors">
              Next →
            </button>
          ) : (
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>
                : isEdit ? "Update Product" : "Add Product"}
            </button>
          )}
        </div>
        {/* Quick save always visible */}
        {activeSection < sections.length - 1 && (
          <button type="submit" disabled={saving}
            className="w-full mt-2 py-2.5 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>
              : isEdit ? "Save All Changes" : "Save Product"}
          </button>
        )}
      </form>
    </div>
  );
};

export default ProductForm;
