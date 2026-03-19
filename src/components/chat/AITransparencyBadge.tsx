import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const AITransparencyBadge = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.04)" }}>
        <span className="text-[9px]" style={{ color: "hsl(0 0% 100% / 0.15)" }}>
          🤖 AI-generated · Verify with a qualified professional ·{" "}
          <button
            onClick={() => setOpen(true)}
            className="underline hover:text-foreground/30 transition-colors"
            style={{ color: "hsl(0 0% 100% / 0.15)" }}
          >
            How this works
          </button>
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm">How Assembl AI Works</DialogTitle>
            <DialogDescription className="sr-only">Information about Assembl's AI technology</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-xs text-foreground/70">
            <div>
              <h4 className="font-semibold text-foreground mb-1">AI Model</h4>
              <p>Assembl agents are powered by Claude, built by Anthropic — one of the world's leading AI safety companies. We use Claude Sonnet for fast, accurate, industry-specific responses.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">How Your Data Is Handled</h4>
              <p>Your conversations are processed in real-time and are not used to train AI models. Uploaded documents are processed for the current session only. We store message metadata for usage tracking but not full conversation content on our servers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Our Commitment to Accuracy</h4>
              <p>Every agent is trained with NZ-specific legislation, standards, and industry knowledge. However, AI can make mistakes. We always recommend verifying important decisions with a qualified professional. All generated templates and advice should be reviewed before use.</p>
            </div>
            <div className="pt-2" style={{ borderTop: "1px solid hsl(0 0% 100% / 0.06)" }}>
              <p className="text-[10px]" style={{ color: "hsl(0 0% 100% / 0.15)" }}>
                © 2026 Assembl. All rights reserved. · Auckland, New Zealand · Built in Aotearoa 🇳🇿
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AITransparencyBadge;
