import { Link, useNavigate } from "react-router-dom";
import { logout, getRole, getUser } from "../api";

export default function Navbar() {
  const nav = useNavigate();
  const role = getRole();
  const user = getUser();

  let cartCount = 0;
  try {
    const cart = JSON.parse(localStorage.getItem("subyCart") || "[]");
    cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  } catch {}

  const signout = () => {
    logout();
    nav(role === "customer" ? "/customer/login" : "/vendor/login");
  };

  return (
    <nav className="navbar">
      <Link
        className="brand"
        to={role === "customer" ? "/customer/home" : "/vendor/dashboard"}
      >
        <span>🍽️</span> Ranaveer
      </Link>
      <div className="nav-links">
        <span className="nav-user">
          {role === "customer" ? "👤" : "👨‍🍳"}{" "}
          {user.username || (role === "customer" ? "Customer" : "Vendor")}
        </span>
        {role === "customer" && (
          <>
            <Link className="nav-link" to="/customer/home">
              Restaurants
            </Link>
            <Link className="nav-link" to="/customer/cart">
              Cart {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
            <Link className="nav-link" to="/customer/orders">
              My Orders
            </Link>
          </>
        )}
        {role === "vendor" && (
          <>
            <Link className="nav-link" to="/vendor/dashboard">
              Dashboard
            </Link>
            <Link className="nav-link" to="/vendor/firms">
              My Restaurants
            </Link>
          </>
        )}
        <button className="nav-button" onClick={signout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
