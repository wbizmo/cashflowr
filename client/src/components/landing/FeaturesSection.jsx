import {
  ShieldCheck,
  Wallet,
  PieChart,
  BellRing,
  BadgeDollarSign,
  LayoutDashboard,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Expense Tracking",
    text: "Track daily transactions and categorize spending with ease.",
  },
  {
    icon: PieChart,
    title: "Budget Insights",
    text: "Visualize spending behavior and optimize financial habits.",
  },
  {
    icon: BellRing,
    title: "Smart Notifications",
    text: "Receive alerts for budgets, bills, and unusual activity.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Infrastructure",
    text: "Built with modern authentication and protected data systems.",
  },
  {
    icon: BadgeDollarSign,
    title: "Savings Goals",
    text: "Create financial targets and monitor your progress over time.",
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    text: "Manage your entire financial overview from one intelligent interface.",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="
        py-24
        border-t border-white/5
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          px-4 md:px-6
        "
      >
        <div className="max-w-3xl">

          <p className="text-blue-400 font-medium mb-4">
            Platform Features
          </p>

          <h2
            className="
              text-4xl md:text-5xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Everything needed to manage your finances intelligently.
          </h2>

        </div>

        <div
          className="
            mt-16
            grid sm:grid-cols-2 lg:grid-cols-3
            gap-6
          "
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="
                group
                rounded-[28px]
                border border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                p-8
                hover:bg-white/[0.05]
                transition-all duration-300
              "
            >
              <div
                className="
                  h-14 w-14
                  rounded-2xl
                  bg-blue-500/10
                  flex items-center justify-center
                  mb-8
                "
              >
                <feature.icon
                  className="
                    text-blue-400
                    group-hover:scale-110
                    transition-transform
                  "
                />
              </div>

              <h3 className="text-2xl font-semibold text-white">
                {feature.title}
              </h3>

              <p
                className="
                  mt-4
                  text-slate-400
                  leading-relaxed
                "
              >
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;