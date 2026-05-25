import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import MobileSidebar from "../components/layout/MobileSidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#070B14] text-white">
      <Sidebar />
      <MobileSidebar />

      <div className="lg:pl-72">
        <Navbar />

        <main className="min-h-[calc(100vh-5rem)] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;