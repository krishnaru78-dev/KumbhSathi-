import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Temples = lazy(() => import("@/pages/temples"));
const TempleDetail = lazy(() => import("@/pages/temple-detail"));
const Events = lazy(() => import("@/pages/events"));
const LostFound = lazy(() => import("@/pages/lost-found"));
const LostFoundNew = lazy(() => import("@/pages/lost-found-new"));
const LostFoundDetail = lazy(() => import("@/pages/lost-found-detail"));
const Emergency = lazy(() => import("@/pages/emergency"));
const AIChat = lazy(() => import("@/pages/ai-chat"));
const Crowd = lazy(() => import("@/pages/crowd"));
const MapPage = lazy(() => import("@/pages/map"));
const Hotels = lazy(() => import("@/pages/hotels"));
const Profile = lazy(() => import("@/pages/profile"));
const Admin = lazy(() => import("@/pages/admin"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30 * 1000, retry: 1 },
  },
});

function PageLoader() {
  return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/hotels" component={Hotels} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
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
