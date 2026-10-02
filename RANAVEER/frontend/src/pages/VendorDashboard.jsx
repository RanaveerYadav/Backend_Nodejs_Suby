import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VendorLayout from "../components/VendorLayout";
import { api, getUser } from "../api";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(getUser());
  const [firms, setFirms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const vendorId = localStorage.getItem("subyVendorId");

    if (!vendorId) {
      navigate("/vendor/login");
      return;
    }

    async function load() {
      try {
        const [vendorData, firmData] = await Promise.all([
          api(`/vendor/single-vendor/${vendorId}`),
          api(`/firm/vendor/${vendorId}/firms`)
        ]);

        setVendor(vendorData || {});
        setFirms(Array.isArray(firmData?.firms) ? firmData.firms : []);

        localStorage.setItem("subyUser", JSON.stringify(vendorData || {}));

        if (firmData?.firms?.[0]?._id) {
          localStorage.setItem("subyFirmId", firmData.firms[0]._id);
        }
      } catch (err) {
        setError(err.message || "Unable to load vendor dashboard");
      }
    }

    load();
  }, [navigate]);

  return (
    <VendorLayout>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">VENDOR DASHBOARD</p>
          <h1 className="page-title">
            Welcome{vendor?.username ? `, ${vendor.username}` : ""}
          </h1>
          <p className="page-subtitle">
            Manage restaurants and products from one place.
          </p>
        </div>
        <Link className="btn btn-primary" to="/vendor/add-firm">
          + Add Firm
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Vendor</span>
          <strong className="stat-value">{vendor?.username || "—"}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Email</span>
          <strong className="stat-value">{vendor?.email || "—"}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Restaurants</span>
          <strong className="stat-value">{firms.length}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="page-title-row compact">
          <div>
            <h2>Your Restaurants</h2>
            <p className="page-subtitle">Select a restaurant to manage its products.</p>
          </div>
          <Link className="btn btn-outline" to="/vendor/firms">
            View All
          </Link>
        </div>

        {!firms.length ? (
          <div className="empty">
            <p>No restaurants found.</p>
            <Link className="btn btn-primary" to="/vendor/add-firm">
              Add Your First Firm
            </Link>
          </div>
        ) : (
          <div className="firm-list">
            {firms.map((firm) => (
              <button
                className="firm-row"
                key={firm._id}
                onClick={() => {
                  localStorage.setItem("subyFirmId", firm._id);
                  navigate(`/vendor/products/${firm._id}`);
                }}
              >
                <span>
                  <strong>{firm.firmname || "Unnamed firm"}</strong>
                  <small>{firm.area || "Area not provided"}</small>
                </span>
                <span>Products →</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
