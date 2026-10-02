import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const firmId = localStorage.getItem("subyFirmId");

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">Vendor Menu</div>

      <nav className="sidebar-menu">
        <NavLink
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          to="/vendor/dashboard"
        >
          Dashboard
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          to="/vendor/firms"
        >
          My Firms
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          to="/vendor/add-firm"
        >
          Add Firm
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          to={firmId ? `/vendor/add-product?firmId=${firmId}` : "/vendor/firms"}
        >
          Add Product
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          to={firmId ? `/vendor/products/${firmId}` : "/vendor/firms"}
        >
          All Products
        </NavLink>
      </nav>
    </aside>
  );
}
