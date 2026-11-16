import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Postulate from "./pages/Postulate";
import MyApplications from "./pages/MyApplications";
import LeaderPanel from "./pages/LeaderPanel";
import AdminHome from "./pages/admin/AdminHome";
import CreateEvent from "./pages/admin/CreateEvent";
import ManageEvent from "./pages/admin/ManageEvent";
import Layout from "./components/Layout";
import { useAuth } from "./auth";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAuth();
  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;
  if (!isAdmin) return <div className="p-8 text-red-600">No tienes acceso.</div>;
  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/eventos/:slug" element={<EventDetail />} />
        <Route path="/eventos/:slug/postular" element={<RequireAuth><Postulate /></RequireAuth>} />
        <Route path="/mis-postulaciones" element={<RequireAuth><MyApplications /></RequireAuth>} />
        <Route path="/lider/:slug" element={<RequireAuth><LeaderPanel /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminHome /></RequireAdmin>} />
        <Route path="/admin/eventos/nuevo" element={<RequireAdmin><CreateEvent /></RequireAdmin>} />
        <Route path="/admin/eventos/:slug" element={<RequireAdmin><ManageEvent /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
