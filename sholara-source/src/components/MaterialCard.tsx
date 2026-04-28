import { Material } from "@/types/material";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props { material: Material; }

export const MaterialCard = ({ material }: Props) => {
  const fileUrl = material.file_path
    ? supabase.storage.from("materials").getPublicUrl(material.file_path).data.publicUrl
    : null;
  const openUrl = fileUrl || material.external_url;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border/70 bg-gradient-card p-6 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-smooth">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
          {material.resource_type}
        </Badge>
      </div>

      <h3 className="font-display text-xl font-semibold leading-snug mb-2 line-clamp-2">
        {material.title}
      </h3>
      {material.description && (
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{material.description}</p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 mb-4">
        <Badge variant="outline" className="text-xs">{material.subject}</Badge>
        <Badge variant="outline" className="text-xs">{material.grade_level}</Badge>
      </div>

      {openUrl && (
        <Button asChild variant="default" size="sm" className="w-full">
          <a href={openUrl} target="_blank" rel="noopener noreferrer">
            {material.file_path ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            {material.file_path ? "Download" : "Open resource"}
          </a>
        </Button>
      )}
    </article>
  );
};
