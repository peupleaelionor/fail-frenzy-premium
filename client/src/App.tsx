/**
 * FAIL FRENZY - Main Application
 * Premium game launcher with full integration
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";

// Base path for GitHub Pages deployment
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || '';
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { GamePage } from "./game/GameComponents";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/game"} component={GamePage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <WouterRouter base={BASE_PATH}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
