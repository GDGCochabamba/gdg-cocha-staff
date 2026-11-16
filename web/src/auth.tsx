import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { isAdminEmail } from "./config/admins";
import type { UserDoc } from "./types";

interface AuthState {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const ref = doc(db, "users", user.uid);

    (async () => {
      const snap = await getDoc(ref);
      if (!snap.exists() && isAdminEmail(user.email)) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName ?? user.email ?? "Admin",
          photoURL: user.photoURL ?? "",
          commissionId: "logistica",
          role: "admin",
          status: "approved",
          tier: "none",
          appliedAt: serverTimestamp(),
          approvedAt: serverTimestamp(),
          acceptedClauseAt: serverTimestamp(),
        });
      }
    })().catch(() => {});

    return onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserDoc) : null);
        setLoading(false);
      },
      () => setLoading(false),
    );
  }, [user]);

  async function signIn() {
    await signInWithPopup(auth, googleProvider);
  }

  async function signOutUser() {
    await signOut(auth);
  }

  return (
    <Ctx.Provider value={{ user, profile, loading, signIn, signOutUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
