import { Link } from "react-router-dom";

const BrandFooter = () => {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-4">
          <Link to="/privacy" className="text-[10px] hover:text-foreground/60 transition-colors" style={{ color: '#ffffff38' }}>Privacy Policy</Link>
          <span className="text-[10px]" style={{ color: '#ffffff18' }}>·</span>
          <Link to="/terms" className="text-[10px] hover:text-foreground/60 transition-colors" style={{ color: '#ffffff38' }}>Terms of Use</Link>
          <span className="text-[10px]" style={{ color: '#ffffff18' }}>·</span>
          <Link to="/cookies" className="text-[10px] hover:text-foreground/60 transition-colors" style={{ color: '#ffffff38' }}>Cookie Policy</Link>
          <span className="text-[10px]" style={{ color: '#ffffff18' }}>·</span>
           <Link to="/disclaimer" className="text-[10px] hover:text-foreground/60 transition-colors" style={{ color: '#ffffff38' }}>Disclaimer</Link>
          <span className="text-[10px]" style={{ color: '#ffffff18' }}>·</span>
          <Link to="/security" className="text-[10px] hover:text-foreground/60 transition-colors" style={{ color: '#ffffff38' }}>Security</Link>
        </div>
        <p className="text-[11px] text-center" style={{ color: '#ffffff38' }}>
          © 2026 Assembl. All rights reserved. · Auckland, New Zealand · Built in Aotearoa 🇳🇿
        </p>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: '#ffffff22' }}>
          Agent designs, system prompts, and automation workflows are proprietary trade secrets of Assembl.
        </p>
      </div>
    </footer>
  );
};

export default BrandFooter;
