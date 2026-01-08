import "./CompleteProfileModal.css";
import { useEffect, useState } from "react";
import {
    apiAttachTags,
    apiDeletePhoto,
    apiDetachTag,
    apiSetPrimaryPhoto,
    apiUpdateProfile,
    apiUploadPhoto,
} from "../../lib/profileApis.js";

function normalizeTag(s) {
    const t = (s || "").trim();
    if (!t) return "";
    return t.startsWith("#") ? t.slice(1).trim() : t;
}

export default function CompleteProfileModal({ me, onDone }) {
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        gender: me?.profile?.gender ?? "",
        preference: me?.profile?.preference ?? "",
        bio: me?.profile?.bio ?? "",
    });

    const [tagInput, setTagInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    // keep local state updated if me changes
    useEffect(() => {
        setForm({
            gender: me?.profile?.gender ?? "",
            preference: me?.profile?.preference ?? "",
            bio: me?.profile?.bio ?? "",
        });
    }, [me]);

    const tags = me?.tags ?? [];
    const photos = me?.photos ?? [];

    const basicsOk = form.gender.trim() && form.preference.trim() && form.bio.trim().length >= 10;
    const tagsOk = tags.length >= 1;
    const photosOk = photos.length >= 1 && photos.some((p) => p.isPrimary);

    async function saveBasics() {
        setMsg("");
        if (!basicsOk) {
            setMsg("Please fill gender + preference + bio (min 10 chars).");
            return;
        }
        try {
            setBusy(true);
            await apiUpdateProfile({
                gender: form.gender.trim(),
                preference: form.preference.trim(),
                bio: form.bio.trim(),
            });
            await onDone();
            setStep(2);
        } catch (e) {
            setMsg(e.message || "Failed to save.");
        } finally {
            setBusy(false);
        }
    }

    async function addTag() {
        setMsg("");
        const t = normalizeTag(tagInput).toLowerCase();
        if (!t) return;
        if (t.length < 2 || t.length > 30) {
            setMsg("Tag must be 2–30 characters.");
            return;
        }
        try {
            setBusy(true);
            await apiAttachTags([t]);
            setTagInput("");
            await onDone();
        } catch (e) {
            setMsg(e.message || "Failed to add tag.");
        } finally {
            setBusy(false);
        }
    }

    async function removeTag(tag) {
        setMsg("");
        try {
            setBusy(true);
            await apiDetachTag(tag);
            await onDone();
        } catch (e) {
            setMsg(e.message || "Failed to remove tag.");
        } finally {
            setBusy(false);
        }
    }

    async function upload(file) {
        setMsg("");
        if (!file) return;
        if (photos.length >= 5) {
            setMsg("You can upload up to 5 photos.");
            return;
        }
        try {
            setBusy(true);
            await apiUploadPhoto(file);
            await onDone();
        } catch (e) {
            setMsg(e.message || "Upload failed.");
        } finally {
            setBusy(false);
        }
    }

    async function setPrimary(photoId) {
        setMsg("");
        try {
            setBusy(true);
            await apiSetPrimaryPhoto(photoId);
            await onDone();
        } catch (e) {
            setMsg(e.message || "Failed to set primary.");
        } finally {
            setBusy(false);
        }
    }

    async function del(photoId) {
        setMsg("");
        try {
            setBusy(true);
            await apiDeletePhoto(photoId);
            await onDone();
        } catch (e) {
            setMsg(e.message || "Failed to delete.");
        } finally {
            setBusy(false);
        }
    }

    function nextFromTags() {
        if (!tagsOk) {
            setMsg("Add at least 1 tag to continue.");
            return;
        }
        setMsg("");
        setStep(3);
    }

    async function finish() {
        setMsg("");
        await onDone();
    }

    return (
        <div className="cpOverlay" role="dialog" aria-modal="true">
            <div className="cpCard">
                <div className="cpHeader">
                    <div>
                        <div className="cpTitle">Complete your profile</div>
                        <div className="cpSub">
                            Step {step}/3 • You must finish before using the app
                        </div>
                    </div>

                    <div className="cpStatus">
                        {basicsOk ? "✅ Basics" : "○ Basics"} • {tagsOk ? "✅ Tags" : "○ Tags"} •{" "}
                        {photosOk ? "✅ Photos" : "○ Photos"}
                    </div>
                </div>

                <div className="cpBody">
                    {step === 1 ? (
                        <>
                            <Field label="Gender">
                                <select
                                    className="cpInput"
                                    value={form.gender}
                                    onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                                >
                                    <option value="">Select…</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </Field>

                            <Field label="Sexual preference">
                                <select
                                    className="cpInput"
                                    value={form.preference}
                                    onChange={(e) => setForm((p) => ({ ...p, preference: e.target.value }))}
                                >
                                    <option value="">Select…</option>
                                    <option value="male">Interested in men</option>
                                    <option value="female">Interested in women</option>
                                    <option value="both">Interested in both</option>
                                    <option value="other">Other</option>
                                </select>
                            </Field>

                            <Field label="Biography">
                <textarea
                    className="cpInput cpTextarea"
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell something about you… (min 10 chars)"
                />
                            </Field>

                            <div className="cpActions right">
                                <button className="cpBtn primary" onClick={saveBasics} disabled={busy}>
                                    {busy ? "Saving…" : "Save & Continue"}
                                </button>
                            </div>
                        </>
                    ) : null}

                    {step === 2 ? (
                        <>
                            <Field label="Interests (tags)">
                                <div className="cpRow">
                                    <input
                                        className="cpInput"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        placeholder="Type #geek and press Add"
                                        disabled={busy}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addTag();
                                            }
                                        }}
                                    />
                                    <button className="cpBtn small" onClick={addTag} disabled={busy}>
                                        Add
                                    </button>
                                </div>

                                <div className="cpChips">
                                    {tags.map((t) => (
                                        <button
                                            key={t}
                                            className="cpChip"
                                            onClick={() => removeTag(t)}
                                            disabled={busy}
                                            type="button"
                                        >
                                            {t} ✕
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <div className="cpActions between">
                                <button className="cpBtn ghost" onClick={() => setStep(1)} disabled={busy}>
                                    Back
                                </button>
                                <button className="cpBtn primary" onClick={nextFromTags} disabled={busy}>
                                    Continue
                                </button>
                            </div>
                        </>
                    ) : null}

                    {step === 3 ? (
                        <>
                            <Field label="Photos (max 5) — choose a profile picture">
                                <input
                                    className="cpFile"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    disabled={busy || photos.length >= 5}
                                    onChange={(e) => upload(e.target.files?.[0])}
                                />

                                <div className="cpHint">{photos.length}/5 uploaded</div>

                                <div className="cpPhotoGrid">
                                    {photos.map((p) => (
                                        <div key={p.id} className="cpPhotoCard">
                                            <img className="cpPhotoImg" src={p.url} alt="" />
                                            <div className="cpPhotoActions">
                                                {p.isPrimary ? (
                                                    <div className="cpPrimaryBadge">✅ Profile picture</div>
                                                ) : (
                                                    <button
                                                        className="cpBtn small"
                                                        onClick={() => setPrimary(p.id)}
                                                        disabled={busy}
                                                        type="button"
                                                    >
                                                        Set primary
                                                    </button>
                                                )}

                                                <button
                                                    className="cpBtn small danger"
                                                    onClick={() => del(p.id)}
                                                    disabled={busy}
                                                    type="button"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Field>

                            <div className="cpActions between">
                                <button className="cpBtn ghost" onClick={() => setStep(2)} disabled={busy}>
                                    Back
                                </button>
                                <button className="cpBtn primary" onClick={finish} disabled={busy || !photosOk}>
                                    {photosOk ? "Finish" : "Pick a primary photo"}
                                </button>
                            </div>
                        </>
                    ) : null}

                    {msg ? <div className="cpMsg">{msg}</div> : null}
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="cpField">
            <div className="cpLabel">{label}</div>
            {children}
        </div>
    );
}
