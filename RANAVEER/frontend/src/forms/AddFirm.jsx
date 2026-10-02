import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VendorLayout from "../components/VendorLayout";
import { api } from "../api";

export default function AddFirm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firmname: "",
    area: "",
    category: "veg",
    region: "south-indian",
    offer: ""
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append("image", image);

    try {
      const response = await api("/firm/add-firm", {
        method: "POST",
        body: data
      });

      if (response?.firm?._id) {
        localStorage.setItem("subyFirmId", response.firm._id);
      }

      setMessage("Firm added successfully.");
      setTimeout(() => navigate("/vendor/firms"), 600);
    } catch (err) {
      setError(err.message || "Unable to add firm");
    } finally {
      setLoading(false);
    }
  }

  return (
    <VendorLayout>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">VENDOR</p>
          <h1 className="page-title">Add Restaurant</h1>
          <p className="page-subtitle">
            Create a restaurant that customers can discover.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form className="panel form-panel" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Firm name</label>
            <input
              className="form-input"
              name="firmname"
              value={form.firmname}
              onChange={change}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Area</label>
            <input
              className="form-input"
              name="area"
              value={form.area}
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
            <label className="form-label">Cuisine / region</label>
            <select
              className="form-select"
              name="region"
              value={form.region}
              onChange={change}
            >
              <option value="south-indian">South Indian</option>
              <option value="north-indian">North Indian</option>
              <option value="chinese">Chinese</option>
              <option value="bakery">Bakery</option>
            </select>
          </div>

          <div className="form-group full">
            <label className="form-label">Offer</label>
            <input
              className="form-input"
              name="offer"
              placeholder="e.g. 20% OFF"
              value={form.offer}
              onChange={change}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Restaurant image</label>
            <input
              className="form-input file-input"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImage(event.target.files?.[0] || null)
              }
            />
          </div>
        </div>

        <button className="btn btn-primary form-submit" disabled={loading}>
          {loading ? "Saving..." : "Add Restaurant"}
        </button>
      </form>
    </VendorLayout>
  );
}
