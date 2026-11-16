import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth";
import { isAdminEmail } from "../config/admins";
import { EVENT } from "../config/event";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, profile, signOutUser } = useAuth();
  const nav = useNavigate();
  const isAdmin = isAdminEmail(user?.email) || profile?.role === "admin";
  const isLeader = profile?.role === "leader";

  async function logout() {
    await signOutUser();
    nav("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-gBlue">{"{"}</span>
              DevFest
              <span className="text-gBlue">{"}"}</span>
            </span>
            <span className="text-xs text-gray-500 hidden sm:inline">· Staff</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {user && (
              <Link to="/mi-estado" className="text-gray-700 hover:text-black">
                Mi estado
              </Link>
            )}
            {isLeader && (
              <Link to="/lider" className="text-gray-700 hover:text-black">
                Panel líder
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-black">
                Admin
              </Link>
            )}
            {user ? (
              <button onClick={logout} className="text-gray-500 hover:text-black">
                Salir
              </button>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        {EVENT.community} · {EVENT.name} · {EVENT.dateLabel}
      </footer>
    </div>
  );
}
