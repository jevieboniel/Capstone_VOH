import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Users,
  Shield,
  BarChart3,
  FileText,
  PhoneCall,
  MapPin,
  Globe,
  AlertTriangle,
  HeartHandshake,
  Eye,
  EyeOff,
} from "lucide-react";

import Button from "../UI/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hotline-poster.')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/95 via-white/85 to-cyan-50/90" />

      <div className="relative z-10">
        {/* HERO SECTION */}
        <div className="px-6 lg:px-20 py-16 grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
              <Shield className="w-4 h-4" />
              Safe records • Secure access • Better care
            </div>

            <h1 className="mt-6 text-4xl lg:text-5xl font-extrabold leading-tight">
              A Safe Home.{" "}
              <span className="text-emerald-700">A Brighter Future.</span>
            </h1>

            <p className="mt-5 text-slate-700 text-lg max-w-xl">
              Securely manage children records, monitor development, track case activities,
              and generate reports — all in one centralized system.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Feature icon={<Users />} title="Children Records" />
              <Feature icon={<BarChart3 />} title="Reports & Analytics" />
              <Feature icon={<FileText />} title="Case Documentation" />
              <Feature icon={<Shield />} title="Secure Role Access" />
            </div>
          </div>

          {/* LOGIN CARD (same style, improved form UI) */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur border border-white/60 shadow-2xl p-8 rounded-3xl">
              <div className="flex flex-col items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-white shadow-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img src="/./assets/voh.png" alt="Logo" className="h-full w-full object-cover" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  Village of Hope
                </h2>
                <p className="mt-1 text-sm text-slate-600 text-center">
                  Child Tracking & Development Monitoring
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900
                        placeholder:text-slate-400 shadow-sm
                        focus:outline-none focus:ring-4 focus:ring-emerald-300/40 focus:border-emerald-400
                        transition"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-slate-900
                      placeholder:text-slate-400 shadow-sm
                      focus:outline-none focus:ring-4 focus:ring-emerald-300/40 focus:border-emerald-400
                      transition"
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
                <Button type="submit" loading={loading} className="w-full">
                  Sign in
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  Protected system access • Authorized users only
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* 🔥 FULL WIDTH HOTLINE SECTION */}
        <div className="py-20 px-6 lg:px-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold">
                <HeartHandshake className="w-4 h-4" />
                Help & Safety Information
              </div>

              <h3 className="mt-4 text-3xl md:text-4xl font-extrabold">
                Hotline Numbers & Support
              </h3>

              <p className="mt-2 text-slate-700">
                If you need help, report a concern, or request assistance.
              </p>
            </div>

            <div className="flex items-center gap-2 text-amber-700 font-medium">
              <AlertTriangle className="w-4 h-4" />
              All calls are confidential.
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* POSTER */}
            <div>
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img src="/hotline-poster.png" alt="Hotline Poster" className="w-full" />
              </div>
            </div>

            {/* HOTLINES */}
            <div className="space-y-6">
              <HotlineCard icon={<PhoneCall />} title="Rescue & Emergencies" number="+63 123 456 7890" />
              <HotlineCard icon={<HeartHandshake />} title="Counseling & Support" number="+63 987 654 3210" />
              <HotlineCard icon={<AlertTriangle />} title="Reporting Child Abuse" number="+63 555 123 4567" />

              {/* INFO ROW KEPT */}
              <div className="mt-2 grid gap-3">
                <InfoRow
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value="Purok 3, Guinobatan, Trinidad, Bohol"
                />
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value="hopegardenvoh@gmail.com"
                />
                <InfoRow
                  icon={<Globe className="w-4 h-4" />}
                  label="Website / FB"
                  value="www.villageofhope.org"
                />
              </div>

              <div className="mt-8 text-center bg-emerald-50 py-4 rounded-2xl border border-emerald-200">
                <p className="text-emerald-900 font-bold text-lg">
                  Protecting children, providing hope.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 bg-white/60 py-6 px-6 lg:px-20 text-sm flex justify-between">
          <span>© {new Date().getFullYear()} Village of Hope</span>
          <span>Secure Internal System</span>
        </div>
      </div>
    </div>
  );
};

/* COMPONENTS */
const Feature = ({ icon, title }) => (
  <div className="flex items-center gap-3 bg-white/70 rounded-2xl p-4 shadow-sm">
    <div className="h-10 w-10 flex items-center justify-center bg-emerald-100 rounded-xl text-emerald-700">
      {icon}
    </div>
    <span className="font-semibold">{title}</span>
  </div>
);

const HotlineCard = ({ icon, title, number }) => (
  <div className="flex items-center gap-4 bg-white/80 p-5 rounded-2xl shadow-md border border-white/60">
    <div className="h-12 w-12 flex items-center justify-center bg-cyan-100 rounded-xl text-cyan-700">
      {icon}
    </div>
    <div>
      <div className="font-bold">{title}</div>
      <div className="text-emerald-700 font-extrabold text-lg">{number}</div>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
    <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
      {icon}
    </div>
    <div className="text-sm">
      <div className="text-slate-500 font-semibold">{label}</div>
      <div className="text-slate-800 font-medium">{value}</div>
    </div>
  </div>
);

export default Login;
