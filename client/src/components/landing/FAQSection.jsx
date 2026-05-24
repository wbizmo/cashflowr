import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is CashFlowr?",
    answer:
      "CashFlowr is a modern financial management platform that helps users track income, expenses, budgets, savings goals, and financial trends from one clean dashboard.",
  },
  {
    question: "Is CashFlowr for individuals or businesses?",
    answer:
      "CashFlowr is designed for individuals, freelancers, and small teams who want a simple but powerful way to understand their money.",
  },
  {
    question: "Can I track real transactions?",
    answer:
      "Yes. Once signed in, users can create, edit, delete, and categorize transactions. Dashboard statistics update based on saved activity.",
  },
  {
    question: "Does CashFlowr support analytics?",
    answer:
      "Yes. The app includes spending trends, income summaries, category breakdowns, budget progress, and financial insights.",
  },
  {
    question: "Is my data protected?",
    answer:
      "CashFlowr uses secure authentication and protected routes. User financial records are tied to their account and stored securely.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center">
          <p className="text-blue-400 font-medium mb-4">FAQ</p>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Questions before you start?
          </h2>

          <p className="mt-5 text-slate-400 text-lg">
            Here are the most common things users want to know about CashFlowr.
          </p>
        </div>

        <div className="mt-14 space-y-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 cursor-pointer"
            >
              <summary className="flex items-center justify-between gap-6 list-none">
                <span className="text-lg font-semibold text-white">
                  {item.question}
                </span>

                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform duration-300" />
              </summary>

              <p className="mt-5 text-slate-400 leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;