import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AccountDropdown from "@/components/AccountDropdown";
import NotificationBell from "@/components/NotificationBell";
import { assemblMark } from "@/assets/brand";

const NAV_LINKS = [
  { to: "/content-hub", label: "Specialist Tools" },
  { to: "/content-hub", label: "Strategy Hub" },
  { to: "/pricing", label: "Pricing" },
  { to: "/embed", label: "Embed" },
  { to: "/dashboard", label: "Intelligence" },
  { to: "/invest", label: "Invest" },
  { to: "/brand-guidelines", label: "Brand" },
];

const BrandNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-3 px-5 sm:px-8 py-3.5"
      style={{
        background: 'rgba(9,9,15,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <motion.img
          src={assemblMark}
          alt="Assembl"
          className="w-9 h-9 object-contain"
          animate={{
            filter: [
              'drop-shadow(0 0 6px rgba(212,168,67,0.5))',
              'drop-shadow(0 0 14px rgba(212,168,67,0.9)) drop-shadow(0 0 28px rgba(58,125,110,0.2))',
              'drop-shadow(0 0 6px rgba(212,168,67,0.5))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex items-baseline gap-1.5">
          <span style={{ fontFamily: "'Lato', sans-serif", fontWeight: 900, letterSpacing: "6px", textTransform: "uppercase", fontSize: "13px", background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 48%, #D4A843 72%, #3A7D6E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ASSEMBL</span>
          <span className="font-mono text-[10px] hidden sm:inline text-white/35">.co.nz</span>
        </div>
      </Link>
      <div className="flex-1" />

      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-6 text-[13px]">
        {NAV_LINKS.map((link) => {
          const isHash = link.to.includes("#");
          const handleClick = isHash
            ? (e: React.MouseEvent) => {
                e.preventDefault();
                const hash = link.to.split("#")[1];
                const basePath = link.to.split("#")[0] || "/";
                if (location.pathname === basePath) {
                  document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate(basePath);
                  setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
                }
              }
            : undefined;
          return (
            <Link
              key={link.to}
              to={isHash ? "#" : link.to}
              onClick={handleClick}
              className="font-body font-medium text-white/65 hover:text-foreground transition-colors duration-250 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 group-hover:w-full transition-all duration-300" />
            </Link>
          );
        })}
        <NotificationBell />
        <AccountDropdown />
      </nav>

      {/* Mobile */}
      <div className="flex sm:hidden items-center gap-1">
        <NotificationBell />
        <AccountDropdown />
      </div>
    </header>
  );
};

export default BrandNav;
