import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/services/api";
import { Plus, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

const ManageProducts = () => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getProducts();
        setProductList(data);
      } catch {
        toast.error("Failed to load products");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminApi.deleteProduct(id);
      setProductList((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product");
    }
  };

  return (
    <div className="container-main py-10">
      <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-bold">Manage Products</h1>
        <Link to="/admin/products/add" className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : productList.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="mb-2">No products yet.</p>
          <Link to="/admin/products/add" className="text-primary hover:underline text-sm">Add your first product →</Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-sm">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Price</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Stock</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {productList.map((p) => (
                <tr key={p._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-sm overflow-hidden bg-secondary flex-shrink-0">
                        {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-sm font-medium">₹{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${p.stock <= 5 ? "text-destructive font-medium" : ""}`}>
                      {p.stock} {p.stock <= 5 && p.stock > 0 ? "(Low)" : p.stock === 0 ? "(Out)" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/edit/${p._id}`} className="p-1.5 hover:bg-secondary rounded-sm transition-colors">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-destructive/10 rounded-sm transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
