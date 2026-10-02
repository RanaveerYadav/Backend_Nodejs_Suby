import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VendorLayout from "../components/VendorLayout";
import { api, imageUrl } from "../api";

export default function AllProducts() {
  const { firmId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    if (!firmId) {
      setError("No restaurant selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api(`/product/${firmId}/product`);

      setRestaurantName(data?.restaurantName || "Restaurant");
      setProducts(Array.isArray(data?.products) ? data.products : []);

      localStorage.setItem("subyFirmId", firmId);
    } catch (err) {
      setProducts([]);
      setError(err.message || "Unable to load products");
    } finally {
      setLoading(false);
    }
  }, [firmId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function removeProduct(productId) {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api(`/product/${productId}`, { method: "DELETE" });
      setProducts((current) =>
        current.filter((product) => String(product._id) !== String(productId))
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
          <p className="page-subtitle">
            Products stored for this restaurant
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-outline" onClick={loadProducts}>
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/vendor/add-product?firmId=${firmId}`)}
          >
            + Add Product
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty">
          <h3>No products found</h3>
          <p>Add a product to this restaurant and it will appear here.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/vendor/add-product?firmId=${firmId}`)}
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product._id}>
              {product.image ? (
                <img
                  className="product-image"
                  src={imageUrl(product.image)}
                  alt={product.productName || "Product"}
                />
              ) : (
                <div className="product-placeholder">🍛</div>
              )}

              <div className="product-body">
                <div className="card-top">
                  <h2 className="product-name">
                    {product.productName || "Unnamed product"}
                  </h2>
                  {product.bestseller && (
                    <span className="badge">Bestseller</span>
                  )}
                </div>

                <p className="product-desc">
                  {product.description || "No description available."}
                </p>

                <strong className="product-price">
                  ₹{Number(product.price || 0).toFixed(2)}
                </strong>

                <div className="chips">
                  {(Array.isArray(product.category)
                    ? product.category
                    : product.category
                      ? [product.category]
                      : []
                  ).map((category) => (
                    <span key={category}>{category}</span>
                  ))}
                </div>

                <button
                  className="btn btn-danger full-btn"
                  onClick={() => removeProduct(product._id)}
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
