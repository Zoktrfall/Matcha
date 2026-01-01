import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import { isValidEmail } from "../../lib/validators.js";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({ email: "", form: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();

        const next = { email: "", form: "" };

        if(!email.trim()) 
            next.email = "Email is required.";
        else if(!isValidEmail(email)) 
            next.email = "Please enter a valid email address.";

        if (next.email) {
            setErrors(next);
            return;
        }

        try {
            setLoading(true);
            setErrors({ email: "", form: "" });
            
            await new Promise((r) => setTimeout(r, 600));
            setSent(true);
        } catch (err) {
            setErrors((prev) => ({ ...prev, form: err.message || "Something went wrong." }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Reset your password"
            subtitle={
                <>
                    Remembered it? <Link to="/login">Go back to login</Link>
                </>
            }
        >
            <form className="authForm" onSubmit={onSubmit} noValidate>
                {!sent ? (
                    <>
                        <p className="authSubtitle" style={{ marginTop: 0 }}>
                            Don't worry, Enter your email and we’ll send you a recovery link.
                        </p>

                        <label className="field">
                            <span className="label">Email</span>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors((p) => ({ ...p, email: "", form: "" }));
                                }}
                                placeholder="Email"
                                autoComplete="email"
                            />
                            {errors.email ? <div className="fieldError">{errors.email}</div> : null}
                        </label>

                        {errors.form ? <div className="errorBox">{errors.form}</div> : null}

                        <button className="primaryBtn" type="submit" disabled={loading}>
                            {loading ? "Sending…" : "Send recovery link"}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="successBox">
                            If an account exists for <b>{email}</b>, we sent a recovery link, Check your email address.
                        </div>

                        <button
                            type="button"
                            className="primaryBtn"
                            onClick={() => {
                                setSent(false);
                                setEmail("");
                            }}
                        >
                            Send another
                        </button>

                        <div style={{ marginTop: 12 }}>
                            <Link to="/login" style={{ color: "rgba(255,255,255,0.85)" }}>
                                Back to login
                            </Link>
                        </div>
                    </>
                )}
            </form>
        </AuthLayout>
    );
}