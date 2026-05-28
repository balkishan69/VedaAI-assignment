"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus,
  History,
  Settings,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  LogOut
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/#create", label: "Create Assessment", icon: FilePlus },
  { href: "/#history", label: "History", icon: History },
];

const bottomItems = [
  { href: "#", label: "Settings", icon: Settings },
  { href: "#", label: "Help & Support", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-saffron to-orange-500 shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white">VedaAI</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Assessment Creator</p>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-saffron/15 text-saffron shadow-sm"
                        : "text-white/60 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-saffron" : ""}`} />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-saffron" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/6 px-3 py-3">
          <ul className="space-y-1">
            {bottomItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/40 transition-all hover:bg-white/8 hover:text-white/70"
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User */}
        <div className="border-t border-white/6 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-emerald-600 text-xs font-bold text-white">
              R
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white/90">Rashmi</p>
              <p className="truncate text-xs text-white/40">Teacher</p>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-md text-white/30 transition hover:bg-white/10 hover:text-white/60" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
