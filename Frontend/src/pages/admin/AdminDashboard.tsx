import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/services/api";
import { DollarSign, IndianRupee, Package, ShoppingCart, Users } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalProducts: 0 });

  useEffect(() => {
    adminApi.getDashboard().then(setStats);
  }, []);

  const cards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-brand-olive" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-brand-warm" },
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-brand-gold" },
  ];

  return (
    <div className="container-main py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="border border-border rounded-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/products" className="border border-border rounded-sm p-6 hover:bg-secondary/50 transition-colors">
          <Package className="h-6 w-6 mb-3 text-primary" />
          <h3 className="font-semibold">Manage Products</h3>
          <p className="text-sm text-muted-foreground mt-1">Add, edit, or remove products</p>
        </Link>
        <Link to="/admin/herbs" className="border border-border rounded-sm p-6 hover:bg-secondary/50 transition-colors">
          <Package className="h-6 w-6 mb-3 text-brand-olive" />
          <h3 className="font-semibold">Manage Herbs</h3>
          <p className="text-sm text-muted-foreground mt-1">Standalone herb encyclopedia management</p>
        </Link>
        <Link to="/admin/orders" className="border border-border rounded-sm p-6 hover:bg-secondary/50 transition-colors">
          <ShoppingCart className="h-6 w-6 mb-3 text-brand-warm" />
          <h3 className="font-semibold">Manage Orders</h3>
          <p className="text-sm text-muted-foreground mt-1">View and update order statuses</p>
        </Link>
        <Link to="/admin/users" className="border border-border rounded-sm p-6 hover:bg-secondary/50 transition-colors">
          <Users className="h-6 w-6 mb-3 text-brand-gold" />
          <h3 className="font-semibold">Manage Users</h3>
          <p className="text-sm text-muted-foreground mt-1">View and manage user accounts</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
