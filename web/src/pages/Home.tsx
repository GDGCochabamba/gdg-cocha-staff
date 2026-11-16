import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { EVENT } from "../config/event";

export default function Home() {
  const { user, profile, loading, signIn } = useAuth();

  if (loading) return <div className="text-gray-500">Cargando…</div>;

  if (user && profile) {
    if (profile.role === "admin") return <Navigate to="/admin" replace />;
    if (profile.role === "leader") return <Navigate to="/lider" replace />;
    return <Navigate to="/mi-estado" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-gBlue">{"{"}</span>
          {" "}DevFest{" "}
          <span className="text-gBlue">{"}"}</span>
        </h1>
        <p className="text-lg text-gray-600">Cochabamba 2026 · {EVENT.dateLabel}</p>
        <p className="text-sm text-gray-500">{EVENT.tagline}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 text-left">
        <h2 className="text-xl font-semibold">Postulación de Staff</h2>
        <p className="text-gray-700 text-sm">
          Gracias por querer ser parte del equipo que hace posible el DevFest Cochabamba.
          Postúlate a una comisión; el equipo organizador revisará tu solicitud.
        </p>
        <p className="text-xs text-gray-500">
          Para postular necesitas iniciar sesión con tu cuenta de Google.
        </p>
        {user ? (
          <Link
            to="/postular"
            className="inline-block w-full text-center py-3 bg-gBlue text-white rounded-lg font-medium hover:brightness-110"
          >
            Postular ahora
          </Link>
        ) : (
          <button
            onClick={signIn}
            className="w-full py-3 bg-gBlue text-white rounded-lg font-medium hover:brightness-110"
          >
            Iniciar sesión con Google
          </button>
        )}
      </div>
    </div>
  );
}
