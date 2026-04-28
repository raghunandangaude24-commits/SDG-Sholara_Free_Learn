import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});
const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(100),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/browse");
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      displayName: fd.get("displayName"),
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/browse`,
        data: { display_name: parsed.data.displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome to Sholara! Check your email to confirm (if required).");
      navigate("/browse");
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/browse");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-bold">Sholara</span>
        </Link>

        <div className="rounded-2xl border border-border/70 bg-card p-8 shadow-elegant">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
              <p className="text-sm text-muted-foreground mb-6">Sign in to continue learning.</p>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password">Password</Label>
                  <Input id="si-password" name="password" type="password" required maxLength={100} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <h1 className="font-display text-2xl font-semibold mb-1">Start learning</h1>
              <p className="text-sm text-muted-foreground mb-6">Create a free account in seconds.</p>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Display name</Label>
                  <Input id="su-name" name="displayName" required minLength={2} maxLength={80} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Password</Label>
                  <Input id="su-password" name="password" type="password" required minLength={6} maxLength={100} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Free for every learner · SDG 4 Quality Education
        </p>
      </div>
    </main>
  );
};

export default AuthPage;
