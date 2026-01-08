import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecipientApply from "./pages/RecipientApply";
import RecipientApplySuccess from "./pages/RecipientApplySuccess";
import RecipientDashboard from "./pages/RecipientDashboard";
import RecipientPublicProfile from "./pages/RecipientPublicProfile";
import DonorRegister from "./pages/DonorRegister";
import DonorDashboard from "./pages/DonorDashboard";
import DonorPublicProfile from "./pages/DonorPublicProfile";
import DreamBoard from "./pages/DreamBoard";
import Leaderboard from "./pages/Leaderboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import RoleSelection from "./pages/RoleSelection";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/recipient/apply" element={<RecipientApply />} />
            <Route path="/recipient/apply/success" element={<RecipientApplySuccess />} />
            <Route path="/recipient/dashboard" element={
              <ProtectedRoute requiredRole="recipient">
                <RecipientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recipient/profile/:id" element={<RecipientPublicProfile />} />
            <Route path="/donor/register" element={<DonorRegister />} />
            <Route path="/donor/dashboard" element={
              <ProtectedRoute requiredRole="donor">
                <DonorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/donor/profile/:id" element={<DonorPublicProfile />} />
            <Route path="/dream-board" element={<DreamBoard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
