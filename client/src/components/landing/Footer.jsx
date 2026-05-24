import { useState } from "react";
import { Link } from "react-router-dom";
import LegalModal from "./LegalModal";

const footerGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Analytics", href: "#analytics" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Transactions", to: "/transactions" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", type: "privacy" },
      { label: "Terms of Service", type: "terms" },
      { label: "Security", type: "security" },
      { label: "Cookie Policy", type: "cookies" },
    ],
  },
];

const Footer = () => {
  const [legalType, setLegalType] = useState(null);

  return (
    <>
      <footer className="border-t border-white/10 bg-[#050812]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-white">
              Cash<span className="text-blue-500">Flowr</span>
            </h2>

            <p className="text-slate-400 mt-4 max-w-md leading-relaxed">
              A modern financial management platform built to help users track
              spending, manage budgets, analyze trends, and gain real financial clarity.
            </p>

            <div className="mt-6 text-sm text-slate-500">
              <p>Email: wbizmo@gmail.com</p>
              <p className="mt-1">Phone: +2347034189200</p>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-white font-semibold mb-5">{group.title}</h3>

              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    ) : link.type ? (
                      <button
                        onClick={() => setLegalType(link.type)}
                        className="text-slate-400 hover:text-white transition-all duration-300 cursor-pointer text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 CashFlowr. All rights reserved.
            </p>

            <p className="text-slate-500 text-sm">
              Finance clarity for modern living.
            </p>
          </div>
        </div>
      </footer>

      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </>
  );
};

export default Footer;