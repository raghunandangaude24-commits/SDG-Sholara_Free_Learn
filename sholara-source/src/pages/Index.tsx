import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Material } from "@/types/material";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MaterialCard } from "@/components/MaterialCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Upload, Search, Users, GraduationCap, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-study.jpg";
import { SUBJECTS } from "@/lib/constants";

const Index = () => {
  const [recent, setRecent] = useState<Material[]>([]);

  useEffect(() => {
    document.title = "Sholara — Free study materials for every learner";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Sholara is a free platform for students to discover, share and download structured study materials across every subject and grade level. Built for SDG 4.");
    (async () => {
      const { data } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      setRecent((data as Material[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 -z-10" />
        <div className="container grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/30 px-3 py-1.5 text-xs font-semibold text-accent-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5" /> SDG 4 · Quality Education
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight mb-6">
              Learning,
              <br />
              <span className="italic text-primary">freely shared.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Structured notes, worksheets and past papers — contributed by learners, free for everyone.
              Discover what you need or give back what helped you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-elegant">
                <Link to="/browse"><Search className="h-4 w-4" /> Browse library <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/upload"><Upload className="h-4 w-4" /> Contribute</Link>
              </Button>
            </div>

            <dl className="grid grid-cols-3 gap-6 mt-12 max-w-md">
              {[
                { n: SUBJECTS.length, l: "Subjects" },
                { n: "100%", l: "Free" },
                { n: "∞", l: "Learners" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-3xl font-bold text-primary">{s.n}</dt>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-float">
            <div className="absolute -inset-8 bg-gradient-accent opacity-20 blur-3xl rounded-full -z-10" />
            <img
              src={heroImg}
              alt="Illustration of an open book with glowing pages surrounded by study materials"
              className="rounded-3xl shadow-elegant w-full object-cover aspect-[4/3]"
              loading="eager"
            />
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card border border-border shadow-elegant p-4 flex items-center gap-3 max-w-[220px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Built for every student</p>
                <p className="text-xs text-muted-foreground">No paywalls. Ever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">How it works</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Three steps, endless learning</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Search, t: "Discover", d: "Filter by subject, grade or resource type. Find exactly what you need." },
            { icon: BookOpen, t: "Learn", d: "Download or open curated notes, worksheets, past papers and more." },
            { icon: Users, t: "Give back", d: "Upload resources that helped you. Lift other learners as you rise." },
          ].map(({ icon: Icon, t, d }, i) => (
            <div key={t} className="relative rounded-2xl border border-border/70 bg-gradient-card p-8 shadow-soft hover:shadow-elegant transition-smooth">
              <div className="font-display text-6xl font-bold text-primary/10 absolute top-4 right-6">0{i + 1}</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft mb-5">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-2">{t}</h3>
              <p className="text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="container py-12">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-2">Fresh resources</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Recently shared</h2>
            </div>
            <Button asChild variant="ghost"><Link to="/browse">View all <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-primary-foreground shadow-elegant">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-4">
              Every learner deserves <span className="italic">structured knowledge.</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Join Sholara — create a free account, build your library, and contribute back when you're ready.
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow">
              <Link to="/auth">Get started free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
