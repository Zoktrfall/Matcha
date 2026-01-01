import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import { apiLogin } from "../../lib/api.js";
import { isValidEmail } from "../../lib/validators.js";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "", form: "" });
    const [loading, setLoading] = useState(false);

    function update(key, value) {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "", form: "" }));
    }

    async function onSubmit(e) {
        e.preventDefault();

        const next = { email: "", password: "", form: "" };
        
        if(!form.email.trim()) 
            next.email = "Email is required.";
        else if(!isValidEmail(form.email)) 
            next.email = "Please enter a valid email address.";
        
        if(!form.password && form.email !== '')
            next.password = "Password is required.";

        if (next.email || next.password) {
            setErrors(next);
            return;
        }

        try {
            setLoading(true);
            setErrors({ email: "", password: "", form: "" });

            await apiLogin(form); 
            alert("Logged in (placeholder). Next: connect to backend.");
        } catch (err) {
            setErrors((prev) => ({ ...prev, form: err.message || "Login failed." }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Welcome back Coder!"
            subtitle={
                <>
                    Don’t have an account? <Link to="/register">Create one</Link>
                </>
            }
        >
            <form className="authForm" onSubmit={onSubmit} noValidate>
                <label className="field">
                    <span className="label">Email</span>
                    <input
                        className="input"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="Email"
                        autoComplete="email"
                    />
                    {errors.email ? <div className="fieldError">{errors.email}</div> : null}
                </label>

                <label className="field">
                    <div className="labelRow">
                        <span className="label">Password</span>

                        {/* ✅ "Forgot password?" link near the password label */}
                        <Link className="forgotLink" to="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    <input
                        className="input"
                        type="password"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />
                    {errors.password ? <div className="fieldError">{errors.password}</div> : null}
                </label>

                {errors.form ? <div className="errorBox">{errors.form}</div> : null}

                <button className="primaryBtn" type="submit" disabled={loading}>
                    {loading ? "Signing in…" : "Log in"}
                </button>

                <div className="dividerRow">
                    <span className="dividerLine" />
                    <span className="dividerText">Or continue with</span>
                    <span className="dividerLine" />
                </div>

                <div className="oauthRow">
                    <button type="button" className="oauthBtn">Google</button>
                    <button type="button" className="oauthBtn">GitHub</button>
                </div>
            </form>
        </AuthLayout>
    );
}