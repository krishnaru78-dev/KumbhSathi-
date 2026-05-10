import { useAuth } from "@/lib/auth";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Temples from "@/pages/temples";
import TempleDetail from "@/pages/temple-detail";
import Events from "@/pages/events";
import LostFound from "@/pages/lost-found";
import LostFoundNew from "@/pages/lost-found-new";
import LostFoundDetail from "@/pages/lost-found-detail";
import Emergency from "@/pages/emergency";
import AIChat from "@/pages/ai-chat";
import Crowd from "@/pages/crowd";
import MapPage from "@/pages/map";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/temples" component={Temples} />
        <Route path="/temples/:id" component={TempleDetail} />
        <Route path="/events" component={Events} />
        <Route path="/lost-found/new" component={LostFoundNew} />
        <Route path="/lost-found/:id" component={LostFoundDetail} />
        <Route path="/lost-found" component={LostFound} />
        <Route path="/emergency" component={Emergency} />
        <Route path="/ai" component={AIChat} />
        <Route path="/crowd" component={Crowd} />
        <Route path="/map" component={MapPage} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
