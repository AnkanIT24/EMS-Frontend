import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService, authService } from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function Section({ icon: Icon, title, description, children, delay = 0 }) {
  return (
    <motion.div {...fadeUp} transition={{ duration: 0.28, delay }}>
      <Card>
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {title}
              </p>
              {description && (
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-5">{children}</div>
      </Card>
    </motion.div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
      <div className="sm:w-44 flex-shrink-0 pt-0.5">
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </p>
        {hint && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">
            {hint}
          </p>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";
  return (
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 flex items-center justify-center text-lg font-bold text-indigo-300 select-none">
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/12 text-indigo-300 border border-indigo-500/20">
      {role || "Administrator"}
    </span>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    userService
      .getCurrentUser()
      .then((user) => {
        setFullName(user.name || "");
        setEmail(user.email || "");
        setRole(user.role || "");
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        toast.error("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePasswordChange = async () => {
    setPwError("");
    if (newPw.length < 8) {
      setPwError("Min. 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }

    setPwSaving(true);
    try {
      await authService.changePassword({ newPassword: newPw });
      toast.success("Password updated. Please log in again.");
      setNewPw("");
      setConfirmPw("");

      // Log out and redirect to login
      setTimeout(() => {
        authService.clearSession();
        navigate("/login");
      }, 1500); // small delay so the toast is visible
    } catch (err) {
      setPwError(err?.response?.data?.message || "Failed to update password");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      <motion.div {...fadeUp} transition={{ duration: 0.22 }}>
        <h1 className="text-base font-bold text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Manage your profile and password.
        </p>
      </motion.div>

      <Section
        icon={User}
        title="Profile"
        description="Your identity within the EMS portal."
        delay={0.04}
      >
        <div className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
            <Avatar name={fullName} />
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {fullName}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {email}
              </p>
              <div className="mt-1.5">
                <RoleBadge role={role} />
              </div>
            </div>
          </div>
          <Field label="Full name">
            <p className="text-sm text-[var(--text-primary)] px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
              {fullName || "—"}
            </p>
          </Field>
          <Field label="Email">
            <p className="text-sm text-[var(--text-primary)] px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
              {email || "—"}
            </p>
          </Field>
          <Field label="Role" hint="Contact a super-admin to change your role.">
            <p className="text-sm text-[var(--text-primary)] px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
              {role || "—"}
            </p>
          </Field>
        </div>
      </Section>

      <Section
        icon={Lock}
        title="Password"
        description="Set a new password for your account."
        delay={0.08}
      >
        <div className="space-y-4">
          <Field label="New password">
            <Input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </Field>
          <Field label="Confirm password">
            <Input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Repeat new password"
            />
          </Field>
          <AnimatePresence>
            {pwError && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] text-rose-400"
              >
                {pwError}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="pt-1">
            <Button
              variant="secondary"
              onClick={handlePasswordChange}
              disabled={pwSaving}
            >
              {pwSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock size={13} />
              )}
              {pwSaving ? "Updating…" : "Update password"}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
