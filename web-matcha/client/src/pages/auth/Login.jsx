import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import { apiLogin } from "../../lib/authApis.js";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({ username: "", password: "", form: "" });
    const [loading, setLoading] = useState(false);

    function update(key, value) {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "", form: "" }));
    }

    async function onSubmit(e) {
        e.preventDefault();

        const next = { username: "", password: "", form: "" };

        if(!form.username.trim()) 
            next.username = "Username is required.";
        if(!form.password) 
            next.password = "Password is required.";

        if (next.username || next.password) {
            setErrors(next);
            return;
        }

        try {
            setLoading(true);
            setErrors({ username: "", password: "", form: "" });

            await apiLogin({
                username: form.username.trim(),
                password: form.password,
            });
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
                    <span className="label">Username</span>
                    <input
                        className="input"
                        type="text"
                        value={form.username}
                        onChange={(e) => update("username", e.target.value)}
                        placeholder="Username"
                        autoComplete="username"
                    />
                    {errors.username ? <div className="fieldError">{errors.username}</div> : null}
                </label>

                <label className="field">
                    <div className="labelRow">
                        <span className="label">Password</span>

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