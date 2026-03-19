import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { drawAssemblPDFHeader, drawAssemblPDFFooter } from "@/lib/pdfBranding";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: Message[];
  agentName: string;
  agentDesignation: string;
  agentColor: string;
}

const ConversationExport = ({ messages, agentName, agentDesignation, agentColor }: Props) => {
  const handleExport = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    let y = drawAssemblPDFHeader(doc, {
      agentName,
      agentDesignation,
      subtitle: `Conversation exported on ${new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      margin,
    });

    const addPage = () => { doc.addPage(); y = 20; };
    const checkPage = (needed: number) => { if (y + needed > 268) addPage(); };

    // Messages
    doc.setTextColor(0);
    for (const msg of messages) {
      checkPage(15);
      const sender = msg.role === "user" ? "You" : agentName;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(msg.role === "user" ? 80 : 20);
      doc.text(sender, margin, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40);
      const plainText = msg.content
        .replace(/^#+\s*/gm, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/^[-*]\s*\[([ xX])\]\s*/gm, (_, c) => (c.trim() ? "☑ " : "☐ "))
        .replace(/^[-*]\s+/gm, "• ");

      const lines = doc.splitTextToSize(plainText, maxWidth);
      for (const line of lines) {
        checkPage(5);
        doc.text(line, margin, y);
        y += 4.5;
      }
      y += 4;
    }

    // Footer on last page
    drawAssemblPDFFooter(doc, { agentName, margin });

    doc.save(`assembl-${agentName.toLowerCase()}-conversation-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (messages.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-jakarta font-medium transition-colors hover:opacity-80 shrink-0"
      style={{ color: agentColor, border: `1px solid ${agentColor}20` }}
      title="Export conversation as PDF"
      aria-label="Export conversation as PDF"
    >
      <Download size={10} />
      <span className="hidden sm:inline">Export</span>
    </button>
  );
};

export default ConversationExport;
