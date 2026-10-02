import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VendorLayout from "../components/VendorLayout";
import { api, imageUrl } from "../api";

export default function VendorFirms() {
  const navigate = useNavigate();
  const [firms, setFirms] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vendorId = localStorage.getItem("subyVendorId");

    if (!vendorId) {
      navigate("/vendor/login");
      return;
    }

    api(`/firm/vendor/${vendorId}/firms`)
      .then((data) => setFirms(Array.isArray(data?.firms) ? data.firms : []))
      .catch((err) => setError(err.message || "Unable to load firms"))
      .finally(() => setLoading(false));
  }, [navigate]);

  async function deleteFirm(firmId) {
    if (!window.confirm("Delete this restaurant and its firm record?")) return;

    try {
      await api(`/firm/${firmId}`, { method: "DELETE" });
      setFirms((current) =>
        current.filter((firm) => String(firm._id) !== String(firmId))
      );

      if (localStorage.getItem("subyFirmId") === firmId) {
        localStorage.removeItem("subyFirmId");
      }
    } catch (err) {
      setError(err.message || "Unable to delete firm");
    }
  }

  return (
    <VendorLayout>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">VENDOR</p>
          <h1 className="page-title">My Restaurants</h1>
          <p className="page-subtitle">Manage your firms and their menus.</p>
        </div>
        <Link className="btn btn-primary" to="/vendor/add-firm">
          + Add Firm
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading restaurants...</div>
      ) : firms.length === 0 ? (
        <div className="empty">
          <h3>No restaurants yet</h3>
          <p>Add your first restaurant to start adding products.</p>
          <Link className="btn btn-primary" to="/vendor/add-firm">
            Add Restaurant
          </Link>
        </div>
      ) : (
        <div className="restaurant-grid">
          {firms.map((firm) => (
            <article className="restaurant-card" key={firm._id}>
              {firm.image ? (
                <img
                  className="restaurant-image"
                  src={imageUrl(firm.image)}
                  alt={firm.firmname || "Restaurant"}
                />
              ) : (
                <div className="restaurant-placeholder">🏪</div>
              )}

              <div className="restaurant-body">
                <div className="card-top">
                  <h3>{firm.firmname || "Unnamed restaurant"}</h3>
                  {firm.offer && (
                    <span className="offer-badge">{firm.offer}</span>
                  )}
                </div>

                <p>{firm.area || "Area not provided"}</p>

                <div className="chips">
                  {(firm.category || []).map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                  {(firm.region || []).map((value) => (
                    <span key={value}>{value}</span>
                  ))}
                </div>

                <div className="card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      localStorage.setItem("subyFirmId", firm._id);
                      navigate(`/vendor/products/${firm._id}`);
                    }}
                  >
                    View Products
                  </button>

                  <Link
                    className="btn btn-outline"
                    to={`/vendor/add-product?firmId=${firm._id}`}
                    onClick={() =>
                      localStorage.setItem("subyFirmId", firm._id)
                    }
                  >
                    Add Product
                  </Link>

                  <button
                    className="btn btn-danger"
                    onClick={() => deleteFirm(firm._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </VendorLayout>
  );
}
