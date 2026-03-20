import { Link } from "react-router-dom";
import nexusLogo from "@/assets/nexus-logo.png";
import AccountDropdown from "@/components/AccountDropdown";

const BrandNav = () => {
  return (
    <header
      className="flex items-center gap-3 px-6 py-3 border-b"
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        background: 'rgba(9, 9, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <img src={nexusLogo} alt="Assembl" className="w-10 h-10 object-contain" />
        <div className="flex items-baseline gap-1">
          <span className="font-syne font-extrabold tracking-[3px] uppercase text-sm" style={{ color: '#E4E4EC' }}>ASSEMBL</span>
          <span className="font-mono-jb text-[11px]" style={{ color: 'rgba(255,255,255,0.1)' }}>.co.nz</span>
        </div>
      </Link>
      <div className="flex-1" />
      <nav className="flex items-center gap-4 text-xs font-jakarta">
        <Link to="/" className="transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.5)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Agents</Link>
        <Link to="/pricing" className="transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.5)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Pricing</Link>
        <Link to="/embed" className="transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.5)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Embed</Link>
        <Link to="/dashboard" className="transition-colors duration-300" style={{ color: 'rgba(255,255,255,0.5)' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>Dashboard</Link>
        <AccountDropdown />
      </nav>
    </header>
  );
};

export default BrandNav;