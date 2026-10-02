import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL || "https://ranaveer-backend-new.onrender.com").replace(/\/+$/, "");

function VendorLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/vendor/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Login failed"
                );
            }

            console.log("LOGIN RESPONSE:", data);

            /*
             * Store the REAL values returned by backend.
             *
             * Different backends sometimes use different
             * property names, so we check the common ones.
             */

            const token =
                data.token ||
                data.accessToken;

            const vendorId =
                data.vendorId ||
                data.vendor?._id ||
                data.vendor?._id?.toString();

            if (!token) {
                throw new Error(
                    "Token was not returned by backend"
                );
            }

            if (!vendorId) {
                throw new Error(
                    "Vendor ID was not returned by backend"
                );
            }

            localStorage.setItem("token", token);
            localStorage.setItem("vendorId", vendorId);

            setMessage("Login successful");

            // Go to vendor dashboard
            navigate("/vendor/dashboard");

        } catch (error) {
            console.error("LOGIN ERROR:", error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-box">

                <h1>Vendor Login</h1>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                {message && (
                    <p>{message}</p>
                )}

            </div>

        </div>
    );
}

export default VendorLogin;