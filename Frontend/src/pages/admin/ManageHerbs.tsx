import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/services/api";
import { Plus, Edit, Trash2, ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Herb {
    _id: string;
    name: string;
    sanskritName: string;
    botanicalName: string;
    category: string[];
}

const ManageHerbs = () => {
    const [herbList, setHerbList] = useState<Herb[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await adminApi.getHerbs();
                setHerbList(data);
            } catch {
                toast.error("Failed to load herbs");
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this herb? This will not delete any associated products, but the herb details will be lost.")) return;
        try {
            await adminApi.deleteHerb(id);
            setHerbList((prev) => prev.filter((h) => h._id !== id));
            toast.success("Herb deleted");
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete herb");
        }
    };

    return (
        <div className="container-main py-10">
            <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Manage Herbs</h1>
                    <p className="text-sm text-muted-foreground mt-1">Standalone Encyclopedia Entries ({herbList.length})</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : herbList.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="mb-2">No herbs found in the encyclopedia.</p>
                    <p className="text-xs">Herbs are usually added automatically when you create a Product.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-border rounded-sm">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Herb Name</th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Botanical Name</th>
                                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Category</th>
                                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {herbList.map((h) => (
                                <tr key={h._id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{h.name}</span>
                                            {h.sanskritName && <span className="text-xs text-muted-foreground italic">{h.sanskritName}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground italic">{h.botanicalName}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {h.category.slice(0, 2).map((cat, i) => (
                                                <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-full capitalize">{cat}</span>
                                            ))}
                                            {h.category.length > 2 && <span className="text-[10px] text-muted-foreground">+{h.category.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <p className="text-[10px] text-muted-foreground mr-2">Edit via Product Form</p>
                                            <button onClick={() => handleDelete(h._id)} className="p-1.5 hover:bg-destructive/10 rounded-sm transition-colors">
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

            <div className="mt-8 p-4 bg-secondary/20 border border-border rounded-sm">
                <div className="flex gap-3">
                    <BookOpen className="h-5 w-5 text-brand-olive flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-semibold">How to edit herbs?</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Currently, herb details (Description, Ayurvedic Properties, Translations) are linked to their corresponding products. To edit a herb's content, go to <strong>Manage Products</strong> and edit the product with the same name.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageHerbs;
