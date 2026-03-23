import { motion } from "framer-motion";
import heroImg from "@/assets/agents/assembl-hero.png";

const AssemblLogo = ({ size = 36 }: { size?: number }) => {
  return (
    <motion.div
      className="inline-flex items-center justify-center shrink-0 relative"
      style={{
        width: size + 10,
        height: size + 10,
      }}
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
