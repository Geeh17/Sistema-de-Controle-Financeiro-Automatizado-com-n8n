"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setErro("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
      router.push("/dashboard");
    } catch (e: any) {
      setErro(e.response?.data?.error || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Glow de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase">Finance AI</span>
          <h1 className="text-3xl font-bold mt-2 text-text">Bem-vindo</h1>
          <p className="text-subtle text-sm mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div>
            <label className="block text-sm text-subtle mb-1.5">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="seu@email.com"
              className="input"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-danger text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-subtle mb-1.5">Senha</label>
            <input
              {...register("senha")}
              type="password"
              placeholder="••••••••"
              className="input"
              autoComplete="current-password"
            />
            {errors.senha && (
              <p className="text-danger text-xs mt-1">{errors.senha.message}</p>
            )}
          </div>

          {erro && (
            <p className="text-danger text-sm text-center">{erro}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
