import { useTheme } from "../../context/ThemeContext";

const AppPreloader = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-colors duration-300 ${
        theme === "light"
          ? "bg-slate-50"
          : "bg-[#070B14]"
      }`}
    >
      <div className="cashflowr-loader" />
    </div>
  );
};

export default AppPreloader;