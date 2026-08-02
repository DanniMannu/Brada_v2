import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import AuthRepository from "@/repositories/AuthRepository";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate?: Date | null;
}

interface AuthContextType {
  user: any;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  register: (
    data: RegisterData
  ) => Promise<boolean>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

  updateUser: (
    values: any
  ) => Promise<void>;

uploadAvatar: () => Promise<string | null>;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const isRefreshing =
    useRef(false);

  useEffect(() => {
    initialize();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (event) => {
          if (
            event === "SIGNED_IN"
          ) {
            refreshUser();
          }

          if (
            event === "SIGNED_OUT"
          ) {
            setUser(null);
          }
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function initialize() {
    try {
      await refreshUser();
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    if (isRefreshing.current)
      return;

    isRefreshing.current = true;

    try {
      const profile =
        await AuthRepository.getCurrentUser();

      setUser(profile);
    } catch (error) {
      console.log(
        "REFRESH USER ERROR:",
        error
      );

      setUser(null);
    } finally {
      isRefreshing.current =
        false;
    }
  }

  async function register(
    values: RegisterData
  ) {
    try {
      await AuthRepository.register(
        values
      );

      await refreshUser();

      return true;
    } catch (error) {
      console.log(
        "REGISTER ERROR:",
        error
      );

      return false;
    }
  }

  async function login(
    email: string,
    password: string
  ) {
    try {
      await AuthRepository.login(
        email,
        password
      );

      await refreshUser();

      return true;
    } catch (error) {
      console.log(
        "LOGIN ERROR:",
        error
      );

      return false;
    }
  }

  async function logout() {
    try {
      await AuthRepository.logout();

      setUser(null);
    } catch (error) {
      console.log(
        "LOGOUT ERROR:",
        error
      );
    }
  }

  async function updateUser(
    values: any
  ) {
    if (!user) return;

    try {
      await AuthRepository.updateProfile(
        user.id,
        values
      );

      await refreshUser();
    } catch (error) {
      console.log(
        "UPDATE USER ERROR:",
        error
      );
    }
  }

  async function uploadAvatar() {
  if (!user) return null;

  try {
    const url =
      await AuthRepository.uploadAvatar(user.id);

    await refreshUser();

    return url;
  } catch (error) {
    console.log(error);
    return null;
  }
}

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth =
  () => useContext(AuthContext);