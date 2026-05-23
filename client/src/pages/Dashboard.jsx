import DashboardLayout from "../layouts/DashboardLayout"

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-4xl font-bold text-white">Welcome back 👋</h1>
        <p className="text-slate-400 mt-2">Here is your financial overview.</p>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
