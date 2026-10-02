import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function VendorLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}
