import React, { useEffect, useState } from "react";
import VendorLayout from "../../components/VendorLayout";
import { api } from "../../api";

export default function AddProduct() {
  const [firms, setFirms] = useState([]);
  const [firmId, setFirmId] = useState(localStorage.getItem("subyFirmId") || "");
  const [form, setForm] = useState({
    productName: "", price: "", category: [], bestseller: "", description: ""
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("subyVendorId");
    if (!id) return;
    api(`/vendor/single-vendor/${id}`)
      .then(data => {
        const list = data?.vendor?.firm || [];
        setFirms(list);
        if (!firmId && list[0]?._id) {
          setFirmId(list[0]._id);
          localStorage.setItem("subyFirmId", list[0]._id);
        }
      })
      .catch(err => setError(err.message));
  }, []);

  function toggleCategory(value) {
    setForm(prev => ({
      ...prev,
      category: prev.category.includes(value)
        ? prev.category.filter(x => x !== value)
        : [...prev.category, value]
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!firmId) {
      setError("Select a firm first. Add a firm and then return here.");
      return;
    }

    const fd = new FormData();
    fd.append("productName", form.productName);
    fd.append("price", form.price);
    form.category.forEach(v => fd.append("category", v));
    fd.append("bestseller", form.bestseller);
    fd.append("description", form.description);
    if (image) fd.append("image", image);

    try {
      const data = await api(`/product/add-product/${firmId}`, {
        method: "POST",
        body: fd
      });
      setSuccess(data?.productName ? `${data.productName} added successfully.` : "Product added successfully.");
      setForm({ productName:"", price:"", category:[], bestseller:"", description:"" });
      setImage(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <VendorLayout>
      <div className="page-head">
        <div><p className="eyebrow">VENDOR</p><h1>Add Product</h1><p className="muted">Fields match your Product schema.</p></div>
      </div>

      <form className="panel form-panel" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <label className="field">
          <span>Firm</span>
          <select value={firmId} onChange={e=>{setFirmId(e.target.value);localStorage.setItem("subyFirmId",e.target.value)}} required>
            <option value="">Select firm</option>
            {firms.map(f=><option value={f._id} key={f._id}>{f.firmname || f._id}</option>)}
          </select>
        </label>

        <div className="form-grid">
          <Field label="Product Name" value={form.productName} onChange={e=>setForm({...form,productName:e.target.value})} />
          <Field label="Price" type="text" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
          <Field label="Bestseller" value={form.bestseller} onChange={e=>setForm({...form,bestseller:e.target.value})} required={false} />
          <label className="field"><span>Image</span><input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0] || null)} /></label>
          <div className="check-group"><span>Category</span>{["veg","non-veg"].map(v=><label key={v}><input type="checkbox" checked={form.category.includes(v)} onChange={()=>toggleCategory(v)} /> {v}</label>)}</div>
          <label className="field full-field"><span>Description</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></label>
        </div>

        <button className="btn primary">Add Product</button>
      </form>
    </VendorLayout>
  );
}
function Field({label,required=true,...props}){return <label className="field"><span>{label}</span><input required={required} {...props}/></label>}