const AppPreloader = () => {
  const savedTheme = localStorage.getItem("cashflowr_theme") || "dark";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-colors duration-300 ${
        savedTheme === "light" ? "bg-slate-50" : "bg-[#070B14]"
      }`}
    >
      <div className="cashflowr-loader" />
    </div>
  );
};

export default AppPreloader;