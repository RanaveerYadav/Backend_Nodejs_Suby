import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import VendorLayout from "../components/VendorLayout";
import { api } from "../api";

export default function AddProduct() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [firmId, setFirmId] = useState(
    params.get("firmId") || localStorage.getItem("subyFirmId") || ""
  );

  const [firms, setFirms] = useState([]);
  const [form, setForm] = useState({
    productName: "",
    price: "",
    category: "veg",
    bestseller: false,
    description: ""
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const vendorId = localStorage.getItem("subyVendorId");
    if (!vendorId) return;

    api(`/firm/vendor/${vendorId}/firms`)
      .then((data) => setFirms(Array.isArray(data?.firms) ? data.firms : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (firmId) localStorage.setItem("subyFirmId", firmId);
  }, [firmId]);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!firmId) {
      setError("Select a restaurant first.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append("image", image);

    try {
      await api(`/product/add-product/${firmId}`, {
        method: "POST",
        body: data
      });

      setMessage("Product added successfully.");
      setForm({
        productName: "",
        price: "",
        category: "veg",
        bestseller: false,
        description: ""
      });
      setImage(null);

      setTimeout(() => navigate(`/vendor/products/${firmId}`), 600);
    } catch (err) {
      setError(err.message || "Unable to add product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <VendorLayout>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">VENDOR</p>
          <h1 className="page-title">Add Product</h1>
          <p className="page-subtitle">
            Add a menu item to one of your restaurants.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form className="panel form-panel" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-group full">
            <label className="form-label">Restaurant</label>
            <select
              className="form-select"
              value={firmId}
              onChange={(event) => setFirmId(event.target.value)}
              required
            >
              <option value="">Select restaurant</option>
              {firms.map((firm) => (
                <option key={firm._id} value={firm._id}>
                  {firm.firmname} — {firm.area}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Product name</label>
            <input
              className="form-input"
              name="productName"
              value={form.productName}
              onChange={change}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input
              className="form-input"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={change}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="category"
              value={form.category}
              onChange={change}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non Veg</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Product image</label>
            <input
              className="form-input file-input"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImage(event.target.files?.[0] || null)
              }
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              name="description"
              value={form.description}
              onChange={change}
              placeholder="Describe the dish..."
            />
          </div>

          <label className="check-row full">
            <input
              type="checkbox"
              name="bestseller"
              checked={form.bestseller}
              onChange={change}
            />
            Mark as bestseller
          </label>
        </div>

        <button className="btn btn-primary form-submit" disabled={loading}>
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>
    </VendorLayout>
  );
}
