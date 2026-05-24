import { Mail, Phone, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="relative py-24 border-t border-white/5 overflow-hidden">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute left-0 bottom-10 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-blue-400 font-medium mb-4">Contact CashFlowr</p>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Need help, partnership details, or product support?
          </h2>

          <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl">
            Reach the CashFlowr team directly for support, product enquiries,
            business collaboration, or account-related assistance.
          </p>

          <div className="mt-8 flex items-center gap-3 text-slate-300">
            <ShieldCheck className="text-emerald-400" />
            <span>Secure support for users and business enquiries.</span>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-2xl">
          <div className="grid gap-4">
            <a
              href="mailto:wbizmo@gmail.com"
              className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0B1120] p-5 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Mail className="text-blue-400 group-hover:scale-110 transition-transform" />
              </div>

              <div>
                <p className="text-sm text-slate-400">Email support</p>
                <p className="text-white font-semibold mt-1">wbizmo@gmail.com</p>
              </div>
            </a>

            <a
              href="tel:+2347034189200"
              className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0B1120] p-5 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
            >
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Phone className="text-purple-400 group-hover:scale-110 transition-transform" />
              </div>

              <div>
                <p className="text-sm text-slate-400">Phone contact</p>
                <p className="text-white font-semibold mt-1">+2347034189200</p>
              </div>
            </a>

            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0B1120] p-5">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <MessageCircle className="text-emerald-400" />
              </div>

              <div>
                <p className="text-sm text-slate-400">Response focus</p>
                <p className="text-white font-semibold mt-1">Support, partnerships, and product enquiries</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#0B1120] p-5">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <MapPin className="text-blue-400" />
              </div>

              <div>
                <p className="text-sm text-slate-400">Availability</p>
                <p className="text-white font-semibold mt-1">Remote-first digital finance support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;