import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VendorLayout from "../../components/VendorLayout";
import { api, imageUrl } from "../../api";

export default function VendorProducts() {
  const { firmId: routeFirmId } = useParams();
  const navigate = useNavigate();
  const firmId = routeFirmId || localStorage.getItem("subyFirmId") || "";

  const [products, setProducts] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!firmId) {
      setError("Select a restaurant first.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await api(`/product/${firmId}/product`);
      setRestaurantName(data?.restaurantName || "Restaurant");
      setProducts(Array.isArray(data?.products) ? data.products : []);
      localStorage.setItem("subyFirmId", firmId);
    } catch (err) {
      setError(err.message || "Unable to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [firmId]);

  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api(`/product/${id}`, { method: "DELETE" });
      setProducts((current) =>
        current.filter((product) => product._id !== id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete product");
    }
  }

  return (
    <VendorLayout>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">VENDOR MENU</p>
          <h1 className="page-title">{restaurantName || "Products"}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`/vendor/add-product?firmId=${firmId}`)}>
          + Add Product
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : !products.length ? (
        <div className="empty">No products found.</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product._id}>
              {product.image ? (
                <img
                  className="product-image"
                  src={imageUrl(product.image)}
                  alt={product.productName}
                />
              ) : (
                <div className="product-placeholder">🍛</div>
              )}
              <div className="product-body">
                <h2 className="product-name">{product.productName}</h2>
                <p className="product-desc">
                  {product.description || "No description available."}
                </p>
                <strong className="product-price">
                  ₹{Number(product.price || 0).toFixed(2)}
                </strong>
                <button
                  className="btn btn-danger full-btn"
                  onClick={() => remove(product._id)}
                >
                  Delete Product
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </VendorLayout>
  );
}
