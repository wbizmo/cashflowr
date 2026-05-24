import {
  Star,
} from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Designer",
    text: "CashFlowr completely changed how I manage monthly expenses. The analytics and budgeting tools are incredibly intuitive.",
  },
  {
    name: "Michael Chen",
    role: "Startup Founder",
    text: "The dashboard experience feels premium and the spending insights genuinely helped optimize my financial planning.",
  },
  {
    name: "David Williams",
    role: "Financial Consultant",
    text: "One of the cleanest financial tracking experiences I've used. Everything feels organized, modern, and effortless.",
  },
];

const TestimonialsSection = () => {
  return (
    <section
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
            Testimonials
          </p>

          <h2
            className="
              text-4xl md:text-5xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Trusted by people who want smarter financial control.
          </h2>

        </div>

        <div
          className="
            mt-16
            grid lg:grid-cols-3
            gap-6
          "
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="
                rounded-[28px]
                border border-white/10
                bg-white/[0.03]
                backdrop-blur-xl
                p-8
              "
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className="
                      text-yellow-400
                      fill-yellow-400
                    "
                  />
                ))}
              </div>

              <p
                className="
                  text-slate-300
                  leading-relaxed
                  text-lg
                "
              >
                "{testimonial.text}"
              </p>

              <div className="mt-8">
                <h4 className="text-white font-semibold">
                  {testimonial.name}
                </h4>

                <p className="text-slate-400 text-sm mt-1">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;