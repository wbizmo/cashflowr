import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import MobileSidebar from "../components/layout/MobileSidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="app-shell min-h-screen text-white">
      <Sidebar />
      <MobileSidebar />

      <div className="lg:pl-64 min-w-0">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)] px-4 py-5 md:px-6 md:py-7 xl:px-8 xl:py-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
