import { Navigate } from "react-router-dom";
export default function ProtectedRoute({children,role="vendor"}){ const token=localStorage.getItem("subyToken"); const current=localStorage.getItem("subyRole"); return token&&current===role?children:<Navigate to={role==="customer"?"/customer/login":"/vendor/login"} replace/>; }
