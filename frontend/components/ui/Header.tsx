"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-5 md:px-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-zinc-100">{user?.name}</p>
          <p className="text-xs text-muted">{user?.email}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => logout()}
          aria-label="Logout"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-expense"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
