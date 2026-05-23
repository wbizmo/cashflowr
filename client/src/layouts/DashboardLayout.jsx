import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import MobileSidebar from "../components/layout/MobileSidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#070B14] text-white flex">

      <Sidebar />

      <MobileSidebar />

      <div className="flex-1 flex flex-col min-w-0">

        <Navbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;