"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Usuario } from "@/types";

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      router.push("/login");
      return;
    }
    setUsuario(JSON.parse(stored));
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  }

  return { usuario, logout };
}
