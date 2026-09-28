import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "./pages/not-found";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import DemoMode from "./pages/DemoMode";

// Protected Route Wrapper
function ProtectedRoute({
  component: Component,
  adminOnly = false
}: {
  component: React.ComponentType,
  adminOnly?: boolean
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Admin Check
  if (adminOnly && user?.email !== "suvethavenkatesan@gmail.com") {
    // If user is logged in but NOT admin, show 404/Forbidden or redirect.
    // Redirecting to complaints list (conceptually the "User Home")
    // Need to avoid infinite loop -> if we are on /complaints, don't redirect to /complaints?
    // But ProtectedRoute wraps the component.

    // To be safe, return a "Forbidden" page or redirect.
    // Since we don't have a dedicated "User Check", we just redirect to home/complaints?
    // Wait, if I redirect to /complaints, and /complaints is also protected WITHOUT adminOnly, then it should work.

    // But I can't trigger a redirect inside render easily without loop risk unless using useEffect, or useLocation.
    // Returning <NotFound /> or a "Banned" message is safer for "Unauthorized".
    // Or just returning null + side effect?
    // Better: Return a "Not Authorized" UI.

    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view the Dashboard.</p>
        <p className="text-sm mt-4">Only suvethavenkatesan@gmail.com can access this page.</p>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      {/* Protected Routes */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/complaints">
        <ProtectedRoute component={Complaints} />
      </Route>
      <Route path="/booking">
        <ProtectedRoute component={Booking} />
      </Route>
      <Route path="/demo">
        <ProtectedRoute component={DemoMode} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
