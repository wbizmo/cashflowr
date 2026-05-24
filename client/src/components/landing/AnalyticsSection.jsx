import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  TrendingUp,
  Activity,
  DollarSign,
} from "lucide-react";

const data = [
  { month: "Jan", income: 2400 },
  { month: "Feb", income: 1398 },
  { month: "Mar", income: 9800 },
  { month: "Apr", income: 3908 },
  { month: "May", income: 4800 },
  { month: "Jun", income: 3800 },
  { month: "Jul", income: 5300 },
];

const AnalyticsSection = () => {
  return (
    <section
      id="analytics"
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

          <p
            className="
              text-blue-400
              font-medium
              mb-4
            "
          >
            Advanced Analytics
          </p>

          <h2
            className="
              text-4xl md:text-5xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Understand your financial behavior in real time.
          </h2>

          <p
            className="
              mt-6
              text-lg
              text-slate-400
              leading-relaxed
            "
          >
            Monitor spending patterns, income flow,
            savings performance, and financial trends
            through intelligent visual reporting tools.
          </p>

        </div>

        <div
          className="
            mt-16
            grid lg:grid-cols-3
            gap-6
          "
        >

          <div
            className="
              lg:col-span-2
              rounded-[32px]
              border border-white/10
              bg-white/[0.03]
              backdrop-blur-xl
              p-6 md:p-8
            "
          >
            <div className="flex items-center justify-between mb-10">

              <div>
                <p className="text-slate-400 text-sm">
                  Income Overview
                </p>

                <h3 className="text-4xl font-bold text-white mt-2">
                  $84,320
                </h3>
              </div>

              <div
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-emerald-500/10
                  text-emerald-400
                  text-sm
                  font-medium
                "
              >
                <TrendingUp size={16} />

                +18.2%
              </div>

            </div>

            <div className="h-[320px]">

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient
                      id="income"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3B82F6"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#income)"
                  />
                </AreaChart>
              </ResponsiveContainer>

            </div>
          </div>

          <div className="space-y-6">

            <div
              className="
                rounded-[28px]
                border border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                p-6
              "
            >
              <div
                className="
                  h-14 w-14
                  rounded-2xl
                  bg-blue-500/10
                  flex items-center justify-center
                  mb-6
                "
              >
                <DollarSign className="text-blue-400" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                $12.8K
              </h3>

              <p className="text-slate-400 mt-2">
                Monthly savings generated through
                budget optimization insights.
              </p>
            </div>

            <div
              className="
                rounded-[28px]
                border border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                p-6
              "
            >
              <div
                className="
                  h-14 w-14
                  rounded-2xl
                  bg-purple-500/10
                  flex items-center justify-center
                  mb-6
                "
              >
                <Activity className="text-purple-400" />
              </div>

              <h3 className="text-3xl font-bold text-white">
                Real-Time
              </h3>

              <p className="text-slate-400 mt-2">
                Live transaction monitoring and
                automated financial activity tracking.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;