import { Link } from "react-router-dom";

const LandingNavbar = () => {
  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-white/10
        bg-[#070B14]/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          px-4 md:px-6
          h-20
          flex items-center justify-between
        "
      >
        <Link
          to="/"
          className="
            text-3xl
            font-bold
            tracking-tight
            text-white
          "
        >
          Cash<span className="text-blue-500">Flowr</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="
              text-slate-300
              hover:text-white
              transition-all
              duration-300
            "
          >
            Features
          </a>

          <a
            href="#analytics"
            className="
              text-slate-300
              hover:text-white
              transition-all
              duration-300
            "
          >
            Analytics
          </a>

          <a
            href="#contact"
            className="
              text-slate-300
              hover:text-white
              transition-all
              duration-300
            "
          >
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">

          <Link
            to="/login"
            className="
              hidden md:flex
              px-5 py-2.5
              rounded-2xl
              text-slate-300
              hover:text-white
              hover:bg-white/5
              transition-all duration-300
            "
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="
              px-5 py-2.5
              rounded-2xl
              bg-white
              text-black
              font-semibold
              hover:scale-[1.03]
              active:scale-[0.98]
              transition-all duration-300
            "
          >
            Get Started
          </Link>

        </div>
      </div>
    </header>
  );
};

export default LandingNavbar;