"use client";
import { createContext, useState, useEffect } from "react";

export type UserDetails = {
  id: string | null;
  username: string | null;
  name: string | null;
  photoUrl?: string | null;
};

// Updated context type to match your data structure
type AuthContextType = {
  token: string | null;
  user: UserDetails;
  login: (data: { token: string; userDetail: UserDetails }) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserDetails>({
    id: null,
    username: null,
    name: null,
    photoUrl: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("authData");
    console.log('Raw stored data:', stored);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Parsed data:', parsed);
      console.log('UserDetail object:', parsed.userDetail);
      
      setToken(parsed.token ?? null);
      setUser({
        id: parsed.userDetail?.id ?? null,
        username: parsed.userDetail?.username ?? null,
        name: parsed.userDetail?.name ?? null,
        photoUrl: parsed.userDetail?.photoUrl ?? null,
      });
    }
    setLoading(false);
  }, []);

  const login: AuthContextType["login"] = (data) => {
    console.log('Login called with data:', data);
    
    setToken(data.token);
    setUser({
      id: data.userDetail.id,
      username: data.userDetail.username,
      name: data.userDetail.name,
      photoUrl: data.userDetail.photoUrl,
    });

    const dataToStore = {
      token: data.token,
      userDetail: {
        id: data.userDetail.id,
        username: data.userDetail.username,
        name: data.userDetail.name,
        photoUrl: data.userDetail.photoUrl,
      },
    };
    
    console.log('Storing to localStorage:', dataToStore);
    localStorage.setItem("authData", JSON.stringify(dataToStore));
  };

  const logout = () => {
    setToken(null);
    setUser({ id: null, username: null, name: null, photoUrl: null });
    localStorage.removeItem("authData");
  };

  // Wait until localStorage is read
  if (loading) return "loading......"; // or <Loading /> spinner

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};