import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  AlertCircle,
  CalendarDays,
  LogOut,
  Settings,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAVIGATION = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Complaints Registeration", href: "/complaints", icon: AlertCircle },
  { label: " Conference Room Booking", href: "/booking", icon: CalendarDays },
  { label: "Demo Mode", href: "/demo", icon: Settings },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <img
            src="/assets/logo.png"
            alt="GMR Aero Technic"
            className="h-12 w-auto object-contain"
          />
        </div>

        <nav className="space-y-2">
          {NAVIGATION.filter(item => item.label !== "Demo Mode").map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                    ${isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout(undefined, { onSuccess: () => setLocation("/login") })}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger and Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover-elevate">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <NavContent />
            </SheetContent>
          </Sheet>
          <img
            src="/assets/logo.png"
            alt="GMR Aero Technic"
            className="h-10 sm:h-12 w-auto object-contain ml-2 transition-all"
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen fixed left-0 top-0 border-r border-border/50 bg-background/50 backdrop-blur-xl z-40">
        <NavContent />
      </aside>
    </>
  );
}
