import { useState } from "react";
import { useLocation } from "wouter";
import { useLoginUser, useGuestLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
      },
    },
  });

  const guestMutation = useGuestLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-primary-foreground font-bold text-3xl leading-none">K</span>
          </div>
          <h1 className="text-2xl font-bold">KumbhSathi</h1>
          <p className="text-muted-foreground text-sm">Your Kumbh Mela 2027 companion</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardContent className="pt-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => guestMutation.mutate({})}
              disabled={guestMutation.isPending}
            >
              {guestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <User className="w-4 h-4 mr-2" />}
              Continue as Guest
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          New pilgrim?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
