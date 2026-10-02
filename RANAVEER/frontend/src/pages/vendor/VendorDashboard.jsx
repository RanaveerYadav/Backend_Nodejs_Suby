import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VendorLayout from "../../components/VendorLayout";
import { api, getUser } from "../../api";

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(getUser());
  const [error, setError] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("subyVendorId");
    if (!id) return;

    api(`/vendor/single-vendor/${id}`)
      .then(data => {
        const v = data?.vendor;
        if (v) {
          setVendor(v);
          localStorage.setItem("subyUser", JSON.stringify(v));
          if (v.firm?.[0]?._id) localStorage.setItem("subyFirmId", v.firm[0]._id);
        }
      })
      .catch(err => setError(err.message));
  }, []);

  return (
    <VendorLayout>
      <div className="page-head">
        <div>
          <p className="eyebrow">VENDOR DASHBOARD</p>
          <h1>Welcome, {vendor?.username || "Vendor"}</h1>
          <p className="muted">Your dashboard is connected to your existing vendor API.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="stats">
        <div className="stat"><span>Vendor</span><strong>{vendor?.username || "—"}</strong></div>
        <div className="stat"><span>Email</span><strong>{vendor?.email || "—"}</strong></div>
        <div className="stat"><span>Firms</span><strong>{vendor?.firm?.length ?? 0}</strong></div>
      </div>

      <div className="action-grid">
        <Link className="action-card" to="/vendor/add-firm"><b>Add Firm</b><span>Create a firm in MongoDB</span></Link>
        <Link className="action-card" to="/vendor/add-product"><b>Add Product</b><span>Add a product to a firm</span></Link>
        <Link className="action-card" to="/vendor/products"><b>All Products</b><span>Load products from MongoDB</span></Link>
      </div>

      <div className="panel">
        <h2>Your Firms</h2>
        {!vendor?.firm?.length && <p className="muted">No firms returned by the backend yet.</p>}
        <div className="firm-list">
          {vendor?.firm?.map(f => (
            <button
              className="firm-row"
              key={f._id}
              onClick={() => localStorage.setItem("subyFirmId", f._id)}
            >
              <span>{f.firmname || f._id}</span>
              <small>{f.area || "Area not provided"}</small>
            </button>
          ))}
        </div>
      </div>
    </VendorLayout>
  );
}