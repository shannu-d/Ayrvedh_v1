import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageHerbs from "./pages/admin/ManageHerbs";
import ProductForm from "./pages/admin/ProductForm";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import ForgotPassword from "./pages/ForgotPassword";
import SymptomChecker from "./pages/SymptomChecker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/symptoms" element={<SymptomChecker />} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
                  <Route path="/admin/herbs" element={<AdminRoute><ManageHerbs /></AdminRoute>} />
                  <Route path="/admin/products/add" element={<AdminRoute><ProductForm /></AdminRoute>} />
                  <Route path="/admin/products/edit/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
                  <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
                  <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
