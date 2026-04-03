/** Decorative harakeke (flax weaving) pattern border — renders as a CSS crosshatch in Kōwhai gold at 5% opacity */
const HarakekePattern = ({ className = "" }: { className?: string }) => (
  <div
    className={`w-full h-3 ${className}`}
    style={{
      backgroundImage: `repeating-linear-gradient(
        45deg,
        transparent,
        transparent 8px,
        rgba(212,168,67,0.05) 8px,
        rgba(212,168,67,0.05) 9px
      ), repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 8px,
        rgba(212,168,67,0.05) 8px,
        rgba(212,168,67,0.05) 9px
      )`,
    }}
  />
);

export default HarakekePattern;
