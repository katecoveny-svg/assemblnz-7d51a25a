import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

const Kete3DModel = lazy(() => import("@/components/kete/Kete3DModel"));

/**
 * Compact 3D kete logo for the header nav bar, with subtle glow.
 */
export default function Nav3DKeteLogo({ size = 38 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size + 8, height: size + 8 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(58,125,110,0.15) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      <Suspense
        fallback={
          <div
            className="rounded-full animate-pulse"
            style={{ width: size, height: size, background: "rgba(58,125,110,0.1)" }}
          />
        }
      >
        <Kete3DModel
          accentColor="#3A7D6E"
          accentLight="#7ECFC2"
          size={size}
        />
      </Suspense>
    </motion.div>
  );
}
