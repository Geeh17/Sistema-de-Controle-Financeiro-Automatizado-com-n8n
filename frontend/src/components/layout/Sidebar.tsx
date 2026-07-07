"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ArrowLeftRight },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-border">
        <span className="text-accent font-mono text-xs tracking-[0.3em] uppercase">Finance AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-subtle hover:text-text hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Usuário + logout */}
      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-subtle truncate">Logado como</p>
          <p className="text-sm text-text font-medium truncate">{usuario?.nome}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-subtle hover:text-danger hover:bg-danger/5 transition-colors duration-150 w-full"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
