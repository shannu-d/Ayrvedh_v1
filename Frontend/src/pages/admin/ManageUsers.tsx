import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { adminApi } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    adminApi.getUsers()
      .then((data: any) => setUsers(Array.isArray(data) ? data : data?.users || []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this user?")) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user");
    }
  };

  const handleToggleAdmin = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Change this user to ${newRole}?`)) return;
    try {
      await adminApi.updateUserRole(id, newRole as "user" | "admin");
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole as "user" | "admin" } : u)));
      toast.success(`User is now ${newRole}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role");
    }
  };

  return (
    <div className="container-main py-10">
      <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="font-serif text-3xl font-bold mb-6">Manage Users</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-sm">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Verified</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">
                    {u.name}
                    {u._id === currentUser?._id && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
                      }`}>
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${u.isVerified ? "text-green-600" : "text-amber-600"}`}>
                      {u.isVerified ? "✓ Yes" : "✗ No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u._id !== currentUser?._id && (
                        <>
                          <button
                            onClick={() => handleToggleAdmin(u._id, u.role)}
                            title={u.role === "admin" ? "Revoke admin" : "Make admin"}
                            className="p-1.5 hover:bg-secondary rounded-sm transition-colors"
                          >
                            <ShieldCheck className={`h-4 w-4 ${u.role === "admin" ? "text-primary" : "text-muted-foreground"}`} />
                          </button>
                          {u.role !== "admin" && (
                            <button onClick={() => handleDelete(u._id)} className="p-1.5 hover:bg-destructive/10 rounded-sm transition-colors">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          )}
                        </>
                      )}
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

export default ManageUsers;
