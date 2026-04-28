import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Material } from "@/types/material";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MaterialCard } from "@/components/MaterialCard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "My library — Sholara";
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("materials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data as Material[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const handleDelete = async (m: Material) => {
    if (!confirm(`Delete "${m.title}"?`)) return;
    if (m.file_path) {
      await supabase.storage.from("materials").remove([m.file_path]);
    }
    const { error } = await supabase.from("materials").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    toast.success("Deleted");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">My library</p>
            <h1 className="font-display text-4xl font-bold">Your contributions</h1>
            <p className="text-muted-foreground mt-2">Resources you've shared with the community.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/upload"><Plus className="h-4 w-4" /> New resource</Link>
          </Button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="font-display text-xl font-semibold mb-2">Nothing here yet</p>
            <p className="text-muted-foreground mb-6">Share your first resource to help other learners.</p>
            <Button asChild><Link to="/upload"><Plus className="h-4 w-4" /> Upload a resource</Link></Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <div key={m.id} className="relative group">
                <MaterialCard material={m} />
                <Button
                  variant="destructive" size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-smooth h-8 w-8"
                  onClick={() => handleDelete(m)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
