const AppPreloader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#070B14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="cashflowr-loader" />

        <p className="text-slate-400 text-sm tracking-wide">
          Loading CashFlowr
        </p>
      </div>
    </div>
  );
};

export default AppPreloader;