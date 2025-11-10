import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { AppLogo } from '@/components/AppLogo';
const navItems = [
  { href: '/experience-demo', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/experience-demo/customers', icon: Users, label: 'Customers' },
  { href: '/experience-demo/products', icon: Package, label: 'Products' },
  { href: '/experience-demo/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/experience-demo/reports', icon: BarChart, label: 'Reports' },
];
const NavContent = () => (
  <div className="flex flex-col h-full">
    <div className="flex h-16 items-center border-b px-6">
      <NavLink to="/experience-demo" className="flex items-center gap-2 font-semibold">
        <AppLogo />
        <span className="font-bold">Demo</span>
      </NavLink>
    </div>
    <nav className="flex-1 grid items-start gap-1 p-4 text-sm font-medium">
      {navItems.map(({ href, icon: Icon, label }) => (
        <NavLink
          key={href}
          to={href}
          end={href.endsWith('/experience-demo')}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary"
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  </div>
);
export function DemoAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 lg:block">
        <NavContent />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">Interactive Demo</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}