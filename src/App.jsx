import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/dashboard/DashboardLayout";

// User Sections
import ChargerList from "./components/dashboard/user/sections/ChargerList";
import ChargerDetail from "./components/dashboard/user/sections/ChargerDetail";

// Host Sections
import HostChargers from "./components/dashboard/host/sections/HostChargers";
import AddCharger from "./components/dashboard/host/sections/AddCharger";
import EditCharger from "./components/dashboard/host/sections/EditCharger"; // new
import HostBookings from "./components/dashboard/host/sections/HostBookings";

// Admin Sections
import UsersManagement from "./components/dashboard/admin/sections/UsersManagement";
import HostsManagement from "./components/dashboard/admin/sections/HostsManagement";
import AllChargers from "./components/dashboard/admin/sections/AllChargers";
import AdminReports from "./components/dashboard/admin/sections/AdminReports";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard */}
        <Route
          path="/user-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <DashboardLayout role="USER" />
            </ProtectedRoute>
          }
        >
          <Route path="chargers" element={<ChargerList />} />
          <Route path="profile" element={<div>User Profile</div>} />
          <Route path="payments" element={<div>User Payments</div>} />
          <Route path="support" element={<div>User Support</div>} />
          <Route index element={<div>Welcome to User Dashboard</div>} />
          <Route path="charger/:id" element={<ChargerDetail />} />
        </Route>

        {/* Host Dashboard */}
<Route
  path="/host-dashboard/*"
  element={
    <ProtectedRoute allowedRoles={["HOST"]}>
      <DashboardLayout role="HOST" />
    </ProtectedRoute>
  }
>
  <Route path="my-chargers" element={<HostChargers />} />
  <Route path="add-charger" element={<AddCharger />} />
  <Route path="edit-charger/:id" element={<EditCharger />} />
  <Route path="bookings" element={<HostBookings />} />
  <Route path="payments" element={<div>Host Payments</div>} />
  <Route path="support" element={<div>Host Support</div>} />
  <Route index element={<div>Welcome to Host Dashboard</div>} />
</Route>
        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardLayout role="ADMIN" />
            </ProtectedRoute>
          }
        >
          <Route path="users" element={<UsersManagement />} />
          <Route path="hosts" element={<HostsManagement />} />
          <Route path="chargers" element={<AllChargers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="support" element={<div>Admin Support</div>} />
          <Route index element={<div>Welcome to Admin Dashboard</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
