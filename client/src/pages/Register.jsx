import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center p-12 border-r border-white/10">
        <div className="absolute h-96 w-96 bg-purple-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-md">
          <h1 className="text-5xl font-bold leading-tight">
            Build better financial habits with Cash
            <span className="text-blue-500">Flowr</span>.
          </h1>

          <p className="mt-6 text-slate-400 text-lg leading-relaxed">
            Create your account and start managing income, expenses, budgets,
            and financial insights from a clean modern dashboard.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="text-3xl font-bold">
            Cash<span className="text-blue-500">Flowr</span>
          </Link>

          <h2 className="text-4xl font-bold mt-10">Create account</h2>
          <p className="text-slate-400 mt-3">
            Start your financial tracking workspace.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">First name</label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 h-14">
                  <User size={18} className="text-slate-500" />
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                    className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Last name</label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 h-14">
                  <User size={18} className="text-slate-500" />
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                    className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Email address</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 h-14">
                <Mail size={18} className="text-slate-500" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 h-14">
                <Lock size={18} className="text-slate-500" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-slate-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;