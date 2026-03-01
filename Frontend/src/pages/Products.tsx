import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { productApi } from "@/services/api";
import { Product, categories } from "@/services/mockData";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "react-i18next";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    productApi.getAll({ category, search, sort, page, limit: 8 }).then((res) => {
      setProducts(res.products);
      setTotal(res.total);
      setPages(res.pages);
      setLoading(false);
    });
  }, [category, search, sort, page]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="container-main py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold">{t("shopAll")}</h1>
        <p className="text-muted-foreground mt-1">{total} {t("products")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("searchProducts")}
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="text-sm border border-border rounded-sm px-3 py-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="text-sm border border-border rounded-sm px-3 py-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">{t("sortBy")}</option>
            <option value="price-asc">{t("priceLowHigh")}</option>
            <option value="price-desc">{t("priceHighLow")}</option>
            <option value="rating">{t("topRated")}</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">{t("noProductsFound")}</p>
          <button onClick={() => setSearchParams({})} className="mt-4 text-sm text-primary hover:underline">{t("clearFilters")}</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam("page", String(p))}
                  className={`w-10 h-10 rounded-sm text-sm font-medium transition-colors ${p === page ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
