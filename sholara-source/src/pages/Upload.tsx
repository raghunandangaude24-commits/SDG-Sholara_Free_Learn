import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS, GRADE_LEVELS, RESOURCE_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

const MAX_FILE_MB = 20;

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  subject: z.string().min(1, "Pick a subject"),
  grade_level: z.string().min(1, "Pick a grade level"),
  resource_type: z.string().min(1, "Pick a resource type"),
  external_url: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
});

const UploadPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    document.title = "Contribute a resource — Sholara";
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const values = {
      title: fd.get("title") as string,
      description: (fd.get("description") as string) || "",
      subject: fd.get("subject") as string,
      grade_level: fd.get("grade_level") as string,
      resource_type: fd.get("resource_type") as string,
      external_url: (fd.get("external_url") as string) || "",
    };
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!file && !parsed.data.external_url) {
      toast.error("Attach a file or provide an external link.");
      return;
    }
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File too large (max ${MAX_FILE_MB}MB).`);
      return;
    }

    setSubmitting(true);
    let filePath: string | null = null;
    try {
      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("materials")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        filePath = path;
      }

      const { error: insErr } = await supabase.from("materials").insert({
        user_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        subject: parsed.data.subject,
        grade_level: parsed.data.grade_level,
        resource_type: parsed.data.resource_type,
        file_path: filePath,
        external_url: parsed.data.external_url || null,
      });
      if (insErr) throw insErr;

      toast.success("Resource shared — thank you!");
      navigate("/browse");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 max-w-2xl">
        <header className="mb-8 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-3">Contribute</p>
          <h1 className="font-display text-4xl font-bold mb-2">Share a study resource</h1>
          <p className="text-muted-foreground">Upload a file or link to something that helped you learn.</p>
        </header>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border/70 bg-card p-8 shadow-soft space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required maxLength={120} placeholder="e.g. Calculus — limits & continuity notes" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" maxLength={1000} rows={3} placeholder="What's inside? Who is it for?" />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select name="subject" required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Grade level *</Label>
              <Select name="grade_level" required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{GRADE_LEVELS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select name="resource_type" required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{RESOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File (PDF, image, doc — up to {MAX_FILE_MB}MB)</Label>
            <Input
              id="file" type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_url">…or an external link</Label>
            <Input id="external_url" name="external_url" type="url" maxLength={500} placeholder="https://…" />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {submitting ? "Sharing…" : "Share resource"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default UploadPage;
