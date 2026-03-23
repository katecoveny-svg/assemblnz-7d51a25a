import { motion } from "framer-motion";
import heroImg from "@/assets/agents/assembl-hero.png";

const AssemblLogo = ({ size = 36 }: { size?: number }) => {
  return (
    <motion.div
      className="inline-flex items-center justify-center shrink-0 relative overflow-hidden"
      style={{
        width: size + 10,
        height: size + 10,
        background: 'rgba(14, 14, 26, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: 12,
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      animate={{
        boxShadow: [
          '0 0 20px rgba(0, 255, 136, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          '0 0 30px rgba(0, 255, 136, 0.2), 0 0 60px rgba(0, 229, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
          '0 0 20px rgba(0, 255, 136, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.img
        src={heroImg}
        alt="Assembl"
        style={{
          width: size + 4,
          height: size + 4,
          objectFit: 'cover',
          borderRadius: 8,
          filter: 'drop-shadow(0 0 6px rgba(0,255,136,0.3))',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
    </motion.div>
  );
};

export default AssemblLogo;
