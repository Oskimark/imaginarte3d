'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, ShoppingBag, ClipboardList, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Si estamos en login, no renderizar barra lateral
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-muted/20">
      {/* Barra Lateral Admin */}
      <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-border bg-card p-4 shrink-0 flex flex-col justify-between">
        <div className="flex flex-col gap-6">
          <div className="px-2 py-3 border-b border-border">
            <span className="font-bold text-base tracking-tight text-foreground">Panel Administración</span>
          </div>
          <nav className="flex flex-col gap-1">
            <Link href="/admin">
              <Button
                variant={pathname === '/admin' ? 'default' : 'ghost'}
                className="w-full justify-start gap-2 text-sm font-semibold cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/productos">
              <Button
                variant={pathname.startsWith('/admin/productos') ? 'default' : 'ghost'}
                className="w-full justify-start gap-2 text-sm font-semibold cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                Gestionar Productos
              </Button>
            </Link>
            <Link href="/admin/pedidos">
              <Button
                variant={pathname.startsWith('/admin/pedidos') ? 'default' : 'ghost'}
                className="w-full justify-start gap-2 text-sm font-semibold cursor-pointer"
              >
                <ClipboardList className="h-4 w-4" />
                Gestionar Pedidos
              </Button>
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
