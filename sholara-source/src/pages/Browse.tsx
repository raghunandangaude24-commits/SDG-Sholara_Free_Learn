import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Material } from "@/types/material";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MaterialCard } from "@/components/MaterialCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS, GRADE_LEVELS, RESOURCE_TYPES } from "@/lib/constants";
import { Search, Loader2, BookOpenCheck } from "lucide-react";

const ALL = "__all__";

const Browse = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>(ALL);
  const [grade, setGrade] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);

  useEffect(() => {
    document.title = "Browse study materials — Sholara";
    (async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setMaterials(data as Material[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      if (subject !== ALL && m.subject !== subject) return false;
      if (grade !== ALL && m.grade_level !== grade) return false;
      if (type !== ALL && m.resource_type !== type) return false;
      if (q && !`${m.title} ${m.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [materials, query, subject, grade, type]);

  const reset = () => {
    setQuery(""); setSubject(ALL); setGrade(ALL); setType(ALL);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <header className="mb-10 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">Library</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Browse study materials</h1>
          <p className="text-muted-foreground max-w-2xl">
            Free notes, worksheets, past papers and more, shared by learners around the world.
          </p>
        </header>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft mb-10">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or description…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="min-w-[160px]"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All subjects</SelectItem>
                {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="min-w-[150px]"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All levels</SelectItem>
                {GRADE_LEVELS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All types</SelectItem>
                {RESOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={reset}>Reset</Button>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-2xl">
            <BookOpenCheck className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <p className="font-display text-xl font-semibold">No materials yet</p>
            <p className="text-muted-foreground mt-2">
              {materials.length === 0
                ? "Be the first to contribute a resource."
                : "Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {filtered.length === 1 ? "resource" : "resources"} found
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => <MaterialCard key={m.id} material={m} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
