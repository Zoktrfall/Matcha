import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import { isValidEmail } from "../../lib/validators.js";
import {apiForgotPassword} from "../../lib/authApis.js";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({ email: "", form: "" });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

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

            await apiForgotPassword(email);
            setShowModal(true);
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
                <p className="authSubtitle" style={{ marginTop: 0 }}>
                    Don't worry, enter your email and we’ll send you a recovery link.
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
            </form>
            
            {showModal ? (
                <div
                    className="modalOverlay"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setShowModal(false)}
                >
                    <div className="modalCard" onClick={(e) => e.stopPropagation()}>
                        <div className="modalTitle">Check your email</div>

                        <div className="modalText">
                            If an account exists for <b>{email}</b>, we sent a recovery link.
                            Please check your inbox.
                        </div>

                        <div className="modalActions">
                            <button
                                type="button"
                                className="secondaryBtn"
                                onClick={() => {
                                    setShowModal(false);
                                    setEmail("");
                                    setErrors({ email: "", form: "" });
                                }}
                            >
                                Send another
                            </button>

                            <button
                                type="button"
                                className="primaryBtn"
                                onClick={() => setShowModal(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </AuthLayout>
    );
}