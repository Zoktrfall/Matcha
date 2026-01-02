import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthLayout from "./AuthLayout.jsx";
import { apiVerifyEmail, apiResendVerification } from "../../lib/api.js";
import { isValidEmail } from "../../lib/validators.js";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const [state, setState] = useState({ loading: true, ok: false, message: "" });
    const [email, setEmail] = useState("");
    const [resendMsg, setResendMsg] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [emailErr, setEmailErr] = useState("");

    useEffect(() => {
        (async () => {
            if (!token) {
                setState({ loading: false, ok: false, message: "Missing verification token." });
                return;
            }

            try {
                await apiVerifyEmail(token);
                setState({ loading: false, ok: true, message: "Your email is verified! You can log in now." });
            } catch (e) {
                setState({ loading: false, ok: false, message: "Something wrong with your Link Coder!" });
            }
        })();
    }, [token]);

    async function resend() {
        setResendMsg("");
        setEmailErr("");

        if(!email.trim()) 
            return setEmailErr("Email is required.");
        if(!isValidEmail(email)) 
            return setEmailErr("Please enter a valid email.");

        try {
            setResendLoading(true);
            await apiResendVerification(email);
            setResendMsg("If that account exists and isn’t verified, we sent a new link. Check your email.");
        } catch (e) {
            setResendMsg("If that account exists and isn’t verified, we sent a new link. Check your email.");
        } finally {
            setResendLoading(false);
        }
    }

    const resent = !!resendMsg;
    return (
        <AuthLayout
            title="Verifying your email"
            subtitle={
                <>
                    Back to <Link to="/login">Log in</Link>
                </>
            }
        >
            {state.loading ? (
                <div className="successBox">Verifying…</div>
            ) : state.ok ? (
                <div className="successBox">
                    <b>Verified!</b>
                    <div style={{ marginTop: 8 }}>{state.message}</div>
                </div>
            ) : (
                <div className="errorBox">
                    <b>Link invalid or expired</b>
                    <div style={{ marginTop: 8 }}>{state.message}</div>

                    <div style={{ marginTop: 14 }}>
                        <label className="field">
                            <span className="label">Email</span>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                disabled={resent || resendLoading}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailErr("");
                                    setResendMsg("");
                                }}
                                placeholder="Email"
                                autoComplete="email"
                            />
                            {emailErr ? <div className="fieldError">{emailErr}</div> : null}
                        </label>

                        {resent ? (
                            <div className="successBox" style={{ marginTop: 10 }}>
                                {resendMsg}
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="primaryBtn"
                                onClick={resend}
                                disabled={resendLoading}
                                style={{ marginTop: 10 }}
                            >
                                {resendLoading ? "Sending…" : "Send new verification link"}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}