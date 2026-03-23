import { motion } from "framer-motion";
import heroImg from "@/assets/agents/hero-3d-robot.png";

const AssemblHeroAgent = ({ size = 200 }: { size?: number }) => {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer glowing orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.1,
          height: size * 1.1,
          background: `radial-gradient(circle, hsla(160,84%,50%,0.06) 30%, hsla(189,100%,50%,0.03) 60%, transparent 80%)`,
          border: '1px solid hsla(160,84%,50%,0.08)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
          boxShadow: [
            '0 0 40px hsla(160,84%,50%,0.08), 0 0 80px hsla(189,100%,50%,0.04)',
            '0 0 60px hsla(160,84%,50%,0.15), 0 0 120px hsla(189,100%,50%,0.08), 0 0 180px hsla(224,100%,68%,0.04)',
            '0 0 40px hsla(160,84%,50%,0.08), 0 0 80px hsla(189,100%,50%,0.04)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: `radial-gradient(circle, hsla(160,84%,50%,0.18), hsla(189,100%,50%,0.1), transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ width: size, height: size }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              background: ["hsl(160,84%,50%)", "hsl(189,100%,50%)", "hsl(224,100%,68%)"][i],
              boxShadow: `0 0 12px ${["hsla(160,84%,50%,0.8)", "hsla(189,100%,50%,0.8)", "hsla(224,100%,68%,0.8)"][i]}`,
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </motion.div>
      ))}

      {/* Robot image */}
      <motion.img
        src={heroImg}
        alt="Assembl AI Agent"
        className="relative z-10 object-contain"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          filter: `drop-shadow(0 0 25px hsla(160,84%,50%,0.3)) drop-shadow(0 0 60px hsla(189,100%,50%,0.15))`,
        }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
    </motion.div>
  );
};

export default AssemblHeroAgent;
