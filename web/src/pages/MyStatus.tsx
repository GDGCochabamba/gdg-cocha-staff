import { useNavigate, Link } from "react-router-dom";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth";
import { commissionName } from "../config/commissions";
import { EVENT_DATE, CANCEL_CUTOFF_MS } from "../config/event";
import StatusBadge from "../components/StatusBadge";
import TierBadge from "../components/TierBadge";

export default function MyStatus() {
  const { user, profile } = useAuth();
  const nav = useNavigate();

  if (!user) return null;
  if (!profile) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4">
        <p className="text-gray-600">Aún no tienes una postulación registrada.</p>
        <Link
          to="/postular"
          className="inline-block py-3 px-5 bg-gBlue text-white rounded-lg font-medium"
        >
          Postular ahora
        </Link>
      </div>
    );
  }

  const canCancel =
    (profile.status === "approved" || profile.status === "pending") &&
    Date.now() < EVENT_DATE.getTime() - CANCEL_CUTOFF_MS;

  const nowVsCutoff = EVENT_DATE.getTime() - Date.now();

  async function cancel() {
    if (!user) return;
    if (!confirm("¿Confirmas que cancelas tu participación? Pasas a Standby para futuros eventos.")) return;
    await updateDoc(doc(db, "users", user.uid), {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
    });
    nav("/");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mi estado</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={profile.status} />
          <TierBadge tier={profile.tier} />
          {profile.role === "leader" && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Líder de comisión
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Row k="Comisión" v={commissionName(profile.commissionId)} />
          <Row k="Nombre" v={profile.displayName} />
          {profile.phone && <Row k="Teléfono" v={profile.phone} />}
          <Row k="Postulado" v={fmt(profile.appliedAt)} />
          {profile.approvedAt && <Row k="Aprobado" v={fmt(profile.approvedAt)} />}
          {profile.cancelledAt && <Row k="Cancelado" v={fmt(profile.cancelledAt)} />}
        </div>

        {canCancel && (
          <div className="pt-2">
            <button
              onClick={cancel}
              className="w-full py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              Cancelar mi participación
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Puedes cancelar sin penalización hasta 48h antes del evento. Faltan{" "}
              {Math.max(0, Math.floor(nowVsCutoff / (1000 * 60 * 60)))} horas.
            </p>
          </div>
        )}
      </div>

      {profile.role === "leader" && (
        <Link
          to="/lider"
          className="block text-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Ir al panel de líder →
        </Link>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function fmt(ts: any): string {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("es-BO");
}
