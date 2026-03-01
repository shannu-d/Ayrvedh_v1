import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { orderApi } from "@/services/api";
import { toast } from "sonner";

const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

interface OrderItem { name: string; quantity: number; price: number; }
interface Order {
  _id: string;
  user?: { name: string; email: string } | string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: { fullName: string };
}

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getAll()
      .then((data: any) => setOrders(Array.isArray(data) ? data : data?.orders || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await orderApi.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const getCustomerName = (order: Order) => {
    if (order.shippingAddress?.fullName) return order.shippingAddress.fullName;
    if (typeof order.user === "object" && order.user) return (order.user as any).name;
    return "—";
  };

  return (
    <div className="container-main py-10">
      <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="font-serif text-3xl font-bold mb-6">Manage Orders</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <p className="text-center py-20 text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-sm">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Order ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{o._id.slice(-8)}</td>
                  <td className="px-4 py-3 text-sm">{getCustomerName(o)}</td>
                  <td className="px-4 py-3 text-sm font-medium">₹{o.total}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className="text-xs border border-border rounded-sm px-2 py-1.5 bg-background focus:outline-none"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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

export default ManageOrders;
