import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import { apiResetPassword } from "../../lib/authApis.js";
import { validatePassword } from "../../lib/validators.js";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = useMemo(() => params.get("token") || "", [params]);

    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [error, setError] = useState("");
    const [ok, setOk] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        if(!token) 
            return setError("Missing token.");

        const pwErr = validatePassword(pw);
        if(pwErr) 
            return setError(pwErr);
        if(pw !== pw2)
            return setError("Passwords do not match.");

        try {
            setLoading(true);
            await apiResetPassword(token, pw);
            setOk(true);
        } catch (e) {
            setError(e.message || "Reset failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Set a new password"
            subtitle={
                <>
                    Back to <Link to="/login">Log in</Link>
                </>
            }
        >
            {ok ? (
                <div className="successBox">
                    <b>Password updated ✅</b>
                    <div style={{ marginTop: 8 }}>
                        You can log in with your new password now.
                    </div>
                </div>
            ) : (
                <form className="authForm" onSubmit={onSubmit} noValidate>
                    <label className="field">
                        <span className="label">New password</span>
                        <div className="passwordField">
                            <input
                                className="input passwordInput"
                                type={showPassword ? "text" : "password"}
                                value={pw}
                                onChange={(e) => setPw(e.target.value)}
                                placeholder="New password"
                                autoComplete="new-password"
                            />
                            <button
                                className="passwordToggle"
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? "Hide new password" : "Show new password"}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </label>

                    <label className="field">
                        <span className="label">Confirm password</span>
                        <div className="passwordField">
                            <input
                                className="input passwordInput"
                                type={showConfirmPassword ? "text" : "password"}
                                value={pw2}
                                onChange={(e) => setPw2(e.target.value)}
                                placeholder="Confirm password"
                                autoComplete="new-password"
                            />
                            <button
                                className="passwordToggle"
                                type="button"
                                onClick={() => setShowConfirmPassword((value) => !value)}
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                aria-pressed={showConfirmPassword}
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </label>

                    {error ? <div className="errorBox">{error}</div> : null}

                    <button className="primaryBtn" type="submit" disabled={loading}>
                        {loading ? "Saving…" : "Update password"}
                    </button>

                    <div style={{ marginTop: 10 }}>
                        <Link className="mutedLink" to="/forgot-password">
                            Need a new reset link?
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
