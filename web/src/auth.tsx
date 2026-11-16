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
  isAdmin: boolean;
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
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? user.email ?? "Usuario",
          photoURL: user.photoURL ?? "",
          isGlobalAdmin: isAdminEmail(user.email),
          createdAt: serverTimestamp(),
        });
      } else {
        const data = snap.data() as UserDoc;
        if (isAdminEmail(user.email) && !data.isGlobalAdmin) {
          await setDoc(ref, { ...data, isGlobalAdmin: true, updatedAt: serverTimestamp() }, { merge: true });
        }
      }
    })().catch((err) => console.error("profile bootstrap", err));

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

  const isAdmin = !!(profile?.isGlobalAdmin || isAdminEmail(user?.email));

  return (
    <Ctx.Provider value={{ user, profile, loading, isAdmin, signIn, signOutUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
