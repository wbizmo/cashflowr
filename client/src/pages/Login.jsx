import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
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
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center p-12 border-r border-white/10">
        <div className="absolute h-96 w-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="relative max-w-md">
          <h1 className="text-5xl font-bold leading-tight">
            Welcome back to Cash<span className="text-blue-500">Flowr</span>.
          </h1>

          <p className="mt-6 text-slate-400 text-lg leading-relaxed">
            Sign in to continue tracking your spending, budgets, savings, and
            financial performance from one secure dashboard.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="text-3xl font-bold">
            Cash<span className="text-blue-500">Flowr</span>
          </Link>

          <h2 className="text-4xl font-bold mt-10">Sign in</h2>
          <p className="text-slate-400 mt-3">
            Access your financial workspace.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-slate-400 text-sm">
            New to CashFlowr?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;