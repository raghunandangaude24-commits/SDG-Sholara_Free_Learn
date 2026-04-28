import { BookOpen } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border/60 mt-24">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="font-display font-semibold">NotesHive</span>
        <span className="text-sm text-muted-foreground">— Free knowledge for every learner.</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Built for SDG 4 · Quality Education · © {new Date().getFullYear()}
      </p>
    </div>
  </footer>
);
