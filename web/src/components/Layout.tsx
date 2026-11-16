import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { useAuth } from "../auth";
import { BRAND } from "../config/brand";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOutUser } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  async function logout() {
    await signOutUser();
    setOpen(false);
    nav("/");
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 rounded-md text-sm ${isActive ? "text-black font-medium" : "text-gray-600 hover:text-black"}`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 min-w-0" onClick={() => setOpen(false)}>
            <span className="text-base sm:text-lg font-bold truncate">
              <span className="text-gBlue">{"{"}</span>
              {" "}{BRAND.shortName}{" "}
              <span className="text-gBlue">{"}"}</span>
              <span className="hidden sm:inline text-gray-500 font-normal text-sm"> · {BRAND.community}</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <NavLink to="/" end className={link}>Eventos</NavLink>
            {user && <NavLink to="/mis-postulaciones" className={link}>Mis postulaciones</NavLink>}
            {isAdmin && <NavLink to="/admin" className={link}>Admin</NavLink>}
            {user ? (
              <button onClick={logout} className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-xs hover:bg-gray-50">
                Salir
              </button>
            ) : null}
          </nav>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded hover:bg-gray-100"
            aria-label="Menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="max-w-5xl mx-auto px-4 py-2 flex flex-col gap-1 text-sm">
              <NavLink to="/" end className={link} onClick={() => setOpen(false)}>Eventos</NavLink>
              {user && <NavLink to="/mis-postulaciones" className={link} onClick={() => setOpen(false)}>Mis postulaciones</NavLink>}
              {isAdmin && <NavLink to="/admin" className={link} onClick={() => setOpen(false)}>Admin</NavLink>}
              {user ? (
                <button onClick={logout} className="mt-1 px-3 py-2 border border-gray-300 rounded-md text-left">
                  Salir ({user.email})
                </button>
              ) : null}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6">{children}</div>
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-500 px-4">
        {BRAND.community} · {BRAND.name}
      </footer>
    </div>
  );
}
