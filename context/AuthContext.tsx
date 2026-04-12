import { mockUsers } from "@/mocks/mockUsers";
import React, { createContext, useContext, useState } from "react";

type Role = "client" | "restaurant" | "courier";

interface AuthContextType {
  user: any;
  role: Role | null;
  login: (email: string, password: string) => Role[] | null;
  selectRole: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);

  const login = (email: string, password: string) => {
    const found = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (!found) return null;

    setUser(found);
    return found.roles;
  };

  const selectRole = (role: Role) => {
    setRole(role);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, selectRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
