"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";

const registrarSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  confirmarSenha: z.string().min(6, "Mínimo 6 caracteres"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegistrarForm = z.infer<typeof registrarSchema>;

export default function RegistrarPage() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrarForm>({
    resolver: zodResolver(registrarSchema),
  });

  async function onSubmit(data: RegistrarForm) {
    setErro("");
    setLoading(true);
    try {
      await api.post("/auth/registrar", {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      });
      // Após cadastrar, loga automaticamente para uma melhor experiência
      const loginRes = await api.post("/auth/login", {
        email: data.email,
        senha: data.senha,
      });
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("usuario", JSON.stringify(loginRes.data.usuario));
      router.push("/dashboard");
    } catch (e: any) {
      setErro(e.response?.data?.error || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="mb-10 text-center">
          <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase">Finance AI</span>
          <h1 className="text-3xl font-bold mt-2 text-text">Criar conta</h1>
          <p className="text-subtle text-sm mt-1">Comece a controlar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div>
            <label className="block text-sm text-subtle mb-1.5">Nome</label>
            <input
              {...register("nome")}
              type="text"
              placeholder="Seu nome"
              className="input"
              autoComplete="name"
            />
            {errors.nome && (
              <p className="text-danger text-xs mt-1">{errors.nome.message}</p>
            )}
          </div>

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
              autoComplete="new-password"
            />
            {errors.senha && (
              <p className="text-danger text-xs mt-1">{errors.senha.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-subtle mb-1.5">Confirmar senha</label>
            <input
              {...register("confirmarSenha")}
              type="password"
              placeholder="••••••••"
              className="input"
              autoComplete="new-password"
            />
            {errors.confirmarSenha && (
              <p className="text-danger text-xs mt-1">{errors.confirmarSenha.message}</p>
            )}
          </div>

          {erro && (
            <p className="text-danger text-sm text-center">{erro}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="text-center text-sm text-subtle">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
