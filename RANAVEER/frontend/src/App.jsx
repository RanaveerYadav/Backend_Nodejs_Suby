import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import VendorDashboard from "./pages/VendorDashboard";
import VendorFirms from "./pages/VendorFirms";
import AllProducts from "./pages/AllProducts";
import VendorRegister from "./forms/VendorRegister";
import VendorLogin from "./forms/VendorLogin";
import AddFirm from "./forms/AddFirm";
import AddProduct from "./forms/AddProduct";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerFirm from "./pages/customer/CustomerFirm";
import Cart from "./pages/customer/Cart";
import CustomerOrders from "./pages/customer/CustomerOrders";

function VendorProductsRedirect() {
  const firmId = localStorage.getItem("subyFirmId");
  return (
    <Navigate
      to={firmId ? `/vendor/products/${firmId}` : "/vendor/firms"}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/vendor/register" element={<VendorRegister />} />
      <Route path="/vendor/login" element={<VendorLogin />} />

      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute role="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/firms"
        element={
          <ProtectedRoute role="vendor">
            <VendorFirms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/add-firm"
        element={
          <ProtectedRoute role="vendor">
            <AddFirm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/add-product"
        element={
          <ProtectedRoute role="vendor">
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/products"
        element={
          <ProtectedRoute role="vendor">
            <VendorProductsRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vendor/products/:firmId"
        element={
          <ProtectedRoute role="vendor">
            <AllProducts />
          </ProtectedRoute>
        }
      />

      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/customer/login" element={<CustomerLogin />} />

      <Route
        path="/customer/home"
        element={
          <ProtectedRoute role="customer">
            <CustomerHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/firm/:firmId"
        element={
          <ProtectedRoute role="customer">
            <CustomerFirm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/cart"
        element={
          <ProtectedRoute role="customer">
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/orders"
        element={
          <ProtectedRoute role="customer">
            <CustomerOrders />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
