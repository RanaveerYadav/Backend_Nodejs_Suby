import React, { useState } from "react";
import VendorLayout from "../../components/VendorLayout";
import { api } from "../../api";

export default function AddFirm() {
  const [form, setForm] = useState({
    firmname: "",
    area: "",
    category: [],
    region: [],
    offer: ""
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggle(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(x => x !== value)
        : [...prev[field], value]
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const fd = new FormData();
    fd.append("firmname", form.firmname);
    fd.append("area", form.area);
    form.category.forEach(v => fd.append("category", v));
    form.region.forEach(v => fd.append("region", v));
    fd.append("offer", form.offer);
    if (image) fd.append("image", image);

    try {
      // IMPORTANT: your backend route is POST /firm/add-firm and verifyToken is required.
      const data = await api("/firm/add-firm", { method: "POST", body: fd });
      setSuccess(data?.message || "Firm added successfully.");
      setForm({ firmname: "", area: "", category: [], region: [], offer: "" });
      setImage(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <VendorLayout>
      <PageTitle title="Add Firm" text="Create a firm using the fields defined by your Firm schema." />
      <form className="panel form-panel" onSubmit={submit}>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="form-grid">
          <Field label="Firm Name" value={form.firmname} onChange={e=>setForm({...form,firmname:e.target.value})} />
          <Field label="Area" value={form.area} onChange={e=>setForm({...form,area:e.target.value})} />
          <Field label="Offer" value={form.offer} onChange={e=>setForm({...form,offer:e.target.value})} required={false} />

          <label className="field">
            <span>Image</span>
            <input type="file" accept="image/*" onChange={e=>setImage(e.target.files?.[0] || null)} />
          </label>

          <CheckGroup title="Category" values={["veg","non-veg"]} selected={form.category} onToggle={v=>toggle("category",v)} />
          <CheckGroup title="Region" values={["south-indian","north-indian","chinese","bakery"]} selected={form.region} onToggle={v=>toggle("region",v)} />
        </div>

        <button className="btn primary">Add Firm</button>
      </form>
    </VendorLayout>
  );
}

function Field({ label, required=true, ...props }) {
  return <label className="field"><span>{label}</span><input required={required} {...props} /></label>;
}
function CheckGroup({ title, values, selected, onToggle }) {
  return <div className="check-group"><span>{title}</span>{values.map(v=><label key={v}><input type="checkbox" checked={selected.includes(v)} onChange={()=>onToggle(v)} /> {v}</label>)}</div>;
}
function PageTitle({title,text}) { return <div className="page-head"><div><p className="eyebrow">VENDOR</p><h1>{title}</h1><p className="muted">{text}</p></div></div>; }