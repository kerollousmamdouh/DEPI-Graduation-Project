import React, { useEffect, useState } from "react";
import { ShieldAlert, Eye, EyeOff, X, Loader2 } from "lucide-react";

/**
 * PasswordConfirmModal
 * Gate for any sensitive action a non-owner team member takes
 * (adding a member, editing team data, updating their own profile, etc.).
 * The action only fires after the OWNER's password is verified by the server —
 * this component never decides on its own whether the password is right.
 *
 * Props:
 *  - open: boolean
 *  - title, description: strings shown in the modal
 *  - onConfirm(password): async fn — should verify the password and, if valid,
 *      perform the pending action. Throw/reject with a message on failure.
 *  - onClose(): called when the user cancels
 */
export default function PasswordConfirmModal({
  open,
  title = "Owner password required",
  description = "This action needs the administrator's password to continue.",
  onConfirm,
  onClose,
}) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
      setSubmitting(false);
      setShowPassword(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Enter the administrator's password.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err?.message || "Incorrect password. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-8 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-50 rounded-xl">
            <ShieldAlert size={22} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Administrator password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoFocus
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus:ring-2 focus:ring-green-500 outline-none pr-12"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}