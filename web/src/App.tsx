import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Postulate from "./pages/Postulate";
import MyStatus from "./pages/MyStatus";
import Admin from "./pages/Admin";
import Leader from "./pages/Leader";
import Layout from "./components/Layout";
import { useAuth } from "./auth";
import { isAdminEmail } from "./config/admins";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;
  if (!user) return <Navigate to="/" replace />;
  const allowed = isAdminEmail(user.email) || profile?.role === "admin";
  if (!allowed) return <div className="p-8 text-red-600">No tienes acceso a esta sección.</div>;
  return <>{children}</>;
}

function RequireLeader({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="p-8 text-gray-500">Cargando…</div>;
  if (!user) return <Navigate to="/" replace />;
  const allowed = profile?.role === "leader" || profile?.role === "admin" || isAdminEmail(user.email);
  if (!allowed) return <div className="p-8 text-red-600">No eres líder de comisión.</div>;
  return <>{children}</>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/postular" element={<RequireAuth><Postulate /></RequireAuth>} />
        <Route path="/mi-estado" element={<RequireAuth><MyStatus /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        <Route path="/lider" element={<RequireLeader><Leader /></RequireLeader>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
