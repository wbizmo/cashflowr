import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  BarChart3,
} from "lucide-react";

const HeroSection = () => {
  return (
    <section
      className="
        relative
        overflow-hidden
        py-24 lg:py-32
      "
    >
      <div
        className="
          absolute
          top-0 left-1/2
          -translate-x-1/2
          w-[700px]
          h-[700px]
          bg-blue-500/10
          blur-[140px]
          rounded-full
        "
      />

      <div
        className="
          relative
          max-w-7xl mx-auto
          px-4 md:px-6
          grid lg:grid-cols-2
          gap-16
          items-center
        "
      >
        <div>

          <div
            className="
              inline-flex
              items-center gap-2
              px-4 py-2
              rounded-full
              border border-white/10
              bg-white/[0.03]
              text-sm text-slate-300
              mb-8
            "
          >
            <ShieldCheck size={16} />

            Smart finance management platform
          </div>

          <h1
            className="
              text-5xl md:text-6xl lg:text-7xl
              font-bold
              tracking-tight
              leading-[1.05]
              text-white
            "
          >
            Finance clarity for modern living.
          </h1>

          <p
            className="
              mt-8
              text-lg md:text-xl
              text-slate-400
              max-w-xl
              leading-relaxed
            "
          >
            CashFlowr helps you monitor spending,
            track budgets, analyze financial habits,
            and make smarter money decisions through
            one intelligent dashboard.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <button
              className="
                flex items-center gap-2
                px-7 py-4
                rounded-2xl
                bg-white
                text-black
                font-semibold
                hover:scale-[1.03]
                active:scale-[0.98]
                transition-all duration-300
                cursor-pointer
              "
            >
              Start Tracking

              <ArrowRight size={18} />
            </button>

            <button
              className="
                px-7 py-4
                rounded-2xl
                border border-white/10
                bg-white/[0.03]
                text-white
                hover:bg-white/[0.05]
                transition-all duration-300
                cursor-pointer
              "
            >
              Explore Dashboard
            </button>

          </div>

          <div
            className="
              mt-14
              grid grid-cols-3
              gap-8
              max-w-lg
            "
          >
            <div>
              <h3 className="text-3xl font-bold text-white">
                50K+
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                Transactions tracked
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                12M+
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                Budget insights generated
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">
                99%
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                Secure infrastructure
              </p>
            </div>
          </div>

        </div>

        <div
          className="
            relative
            rounded-[32px]
            border border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
            p-6
            shadow-2xl
          "
        >
          <div className="grid gap-6">

            <div
              className="
                rounded-3xl
                bg-[#0B1120]
                border border-white/10
                p-6
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">
                    Monthly Savings
                  </p>

                  <h3 className="text-4xl font-bold text-white mt-3">
                    $12,847
                  </h3>
                </div>

                <div
                  className="
                    h-14 w-14
                    rounded-2xl
                    bg-blue-500/10
                    flex items-center justify-center
                  "
                >
                  <Wallet className="text-blue-400" />
                </div>
              </div>
            </div>

            <div
              className="
                rounded-3xl
                bg-[#0B1120]
                border border-white/10
                p-6
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">
                    Expense Analytics
                  </p>

                  <h3 className="text-4xl font-bold text-white mt-3">
                    84%
                  </h3>
                </div>

                <div
                  className="
                    h-14 w-14
                    rounded-2xl
                    bg-purple-500/10
                    flex items-center justify-center
                  "
                >
                  <BarChart3 className="text-purple-400" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;