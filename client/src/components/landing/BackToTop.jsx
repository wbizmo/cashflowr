import {
  ArrowUp,
} from "lucide-react";

const BackToTop = () => {
  return (
    <a
      href="#top"
      className="
        fixed
        bottom-6 right-6
        z-50
        h-12 w-12
        rounded-2xl
        border border-white/10
        bg-[#0B1120]/80
        backdrop-blur-xl
        flex items-center justify-center
        text-white
        hover:scale-110
        active:scale-95
        transition-all duration-300
        shadow-2xl
      "
    >
      <ArrowUp size={18} />
    </a>
  );
};

export default BackToTop;