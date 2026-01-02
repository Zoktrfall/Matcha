import { Link } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import { apiRegister } from "../../lib/authApis.js";
import { isValidEmail, validatePassword } from "../../lib/validators.js";

export default function Register() {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        agree: false,
    });

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        agree: "",
        form: "",
    });

    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [loading, setLoading] = useState(false);

    function update(key, value) {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "", form: "" }));
    }

    function resetForm() {
        setForm({
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
            agree: false,
        });
        setErrors({
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
            agree: "",
            form: "",
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        const next = {
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
            agree: "",
            form: "",
        };

        if(!form.firstName.trim())
            next.firstName = "First name is required.";
        if(!form.lastName.trim()) 
            next.lastName = "Last name is required.";
        
        if(next.firstName || next.lastName) {
            setErrors(next);
            return;
        }
        
        const u = form.username.trim();
        if(!u) 
            next.username = "Username is required.";
        else if(u.length < 3) 
            next.username = "Username must be at least 3 characters.";

        if(!form.email.trim()) 
            next.email = "Email is required.";
        else if(!isValidEmail(form.email)) 
            next.email = "Please enter a valid email address.";

        if(next.username || next.email) {
            setErrors(next);
            return;
        }
        
        const pwError = validatePassword(form.password);
        if(pwError) 
            next.password = pwError;

        if(!form.agree) 
            next.agree = "You must agree to the Terms & Conditions.";
        
        if (next.password || next.agree) {
            setErrors(next);
            return;
        }

        try {
            setLoading(true);
            setErrors({
                firstName: "",
                lastName: "",
                username: "",
                email: "",
                password: "",
                agree: "",
                form: "",
            });

            await apiRegister(form);
            setShowVerifyModal(true);
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                form: err.message || "Registration failed.",
            }));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Start your journey!"
            subtitle={
                <>
                    Already have an account? <Link to="/login">Log in</Link>
                </>
            }
        >
            <form className="authForm" onSubmit={onSubmit} noValidate>
                <div className="grid2">
                    <label className="field">
                        <span className="label">First name</span>
                        <input
                            className="input"
                            value={form.firstName}
                            onChange={(e) => update("firstName", e.target.value)}
                            placeholder="First name"
                            autoComplete="given-name"
                        />
                        {errors.firstName ? <div className="fieldError">{errors.firstName}</div> : null}
                    </label>

                    <label className="field">
                        <span className="label">Last name</span>
                        <input
                            className="input"
                            value={form.lastName}
                            onChange={(e) => update("lastName", e.target.value)}
                            placeholder="Last name"
                            autoComplete="family-name"
                        />
                        {errors.lastName ? <div className="fieldError">{errors.lastName}</div> : null}
                    </label>
                </div>
                
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
                    <span className="label">Password</span>
                    <input
                        className="input"
                        type="password"
                        value={form.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="new-password"
                    />
                    {errors.password ? <div className="fieldError">{errors.password}</div> : null}
                </label>

                <label className="checkRow">
                    <input
                        type="checkbox"
                        checked={form.agree}
                        onChange={(e) => update("agree", e.target.checked)}
                    />
                    <span>
            I agree to the <a href="#">Terms &amp; Conditions</a>
          </span>
                </label>
                {errors.agree ? <div className="fieldError">{errors.agree}</div> : null}

                {errors.form ? <div className="errorBox">{errors.form}</div> : null}

                <button className="primaryBtn" type="submit" disabled={loading}>
                    {loading ? "Creating…" : "Create account"}
                </button>

                <div className="dividerRow">
                    <span className="dividerLine" />
                    <span className="dividerText">Or register with</span>
                    <span className="dividerLine" />
                </div>

                <div className="oauthRow">
                    <button type="button" className="oauthBtn">Google</button>
                    <button type="button" className="oauthBtn">GitHub</button>
                </div>
            </form>

            {showVerifyModal ? (
                <div
                    className="modalOverlay"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setShowVerifyModal(false)}
                >
                    <div className="modalCard" onClick={(e) => e.stopPropagation()}>
                        <div className="modalTitle">Check your email</div>

                        <div className="modalText">
                            We sent a verification link to <b>{form.email}</b>.
                            <br />
                            Open it to activate your account.
                        </div>

                        <div className="modalActions">
                            <Link className="mutedLink" to="/login">
                                Go to login
                            </Link>

                            <button
                                type="button"
                                className="primaryBtn"
                                onClick={() => {
                                    setShowVerifyModal(false);
                                    resetForm();
                                }}
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
