import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, HeartPulse, Star, RotateCcw, Play, Pause, Compass } from 'lucide-react';

interface HeroCanvasProps {
  logoUrl?: string;
  onInteract?: () => void;
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({ logoUrl = '/logo.jpeg' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logo3dRef = useRef<HTMLDivElement>(null);

  // Auto-rotation & drag states
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  // Plaque gentle tilt
  const [plaqueRotX, setPlaqueRotX] = useState(0);
  const [plaqueRotY, setPlaqueRotY] = useState(0);

  // Animation values in refs for silky-smooth 60/120fps (zero React re-render stalls)
  const rotYRef = useRef(0); // 0 to 360 degrees
  const rotXRef = useRef(0); // -35 to +35 degrees tilt
  const isDraggingRef = useRef(false);
  const isAutoRotatingRef = useRef(true);
  const pointerStartRef = useRef({ x: 0, y: 0, rotY: 0, rotX: 0 });
  const pointerLastRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityYRef = useRef(0);
  const velocityXRef = useRef(0);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Continuous 360-degree rotation animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isDraggingRef.current) {
        if (isAutoRotatingRef.current) {
          // Continuous smooth 360-degree rotation (26 deg/sec = majestic, fluid spin)
          rotYRef.current = (rotYRef.current + 26 * delta) % 360;
          // Smoothly return X tilt to 0 when not dragging
          rotXRef.current += (0 - rotXRef.current) * Math.min(1, 3.5 * delta);
        } else if (Math.abs(velocityYRef.current) > 0.05 || Math.abs(velocityXRef.current) > 0.05) {
          // Inertial glide after drag release
          rotYRef.current = (rotYRef.current + velocityYRef.current) % 360;
          rotXRef.current = Math.max(-30, Math.min(30, rotXRef.current + velocityXRef.current));
          velocityYRef.current *= 0.93;
          velocityXRef.current *= 0.93;
        }
      }

      // Update 3D logo rotation directly on DOM for 60/120fps hardware-accelerated smoothness
      if (logo3dRef.current) {
        const y = rotYRef.current;
        const x = rotXRef.current;
        logo3dRef.current.style.transform = `rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg)`;
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  // Smooth mouse move handler for physical plaque background tilt & specular glare
  const handlePlaqueMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -8;
    const rotY = ((x - centerX) / centerX) * 10;

    setPlaqueRotX(rotX);
    setPlaqueRotY(rotY);

    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.85,
    });
  };

  const handlePlaqueMouseEnter = () => {
    setIsHovered(true);
  };

  const handlePlaqueMouseLeave = () => {
    setIsHovered(false);
    setPlaqueRotX(0);
    setPlaqueRotY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  // 360-degree interactive pointer drag handlers (Mouse and Touch)
  const handleLogoPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    setIsDragging(true);
    isDraggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: rotYRef.current,
      rotX: rotXRef.current,
    };
    pointerLastRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };
    velocityYRef.current = 0;
    velocityXRef.current = 0;
  };

  const handleLogoPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    // Full 360° horizontal rotation sensitivity (0.7 deg/px)
    rotYRef.current = (pointerStartRef.current.rotY + dx * 0.7) % 360;
    // Vertical tilt range (-35deg to +35deg)
    rotXRef.current = Math.max(-35, Math.min(35, pointerStartRef.current.rotX - dy * 0.45));

    // Calculate throw momentum
    const now = performance.now();
    const dt = Math.max(1, now - pointerLastRef.current.time);
    const stepDx = e.clientX - pointerLastRef.current.x;
    const stepDy = e.clientY - pointerLastRef.current.y;

    velocityYRef.current = (stepDx / dt) * 14;
    velocityXRef.current = -(stepDy / dt) * 8;

    pointerLastRef.current = { x: e.clientX, y: e.clientY, time: now };
  };

  const handleLogoPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleResetRotation = (e: React.MouseEvent) => {
    e.stopPropagation();
    rotYRef.current = 0;
    rotXRef.current = 0;
    velocityYRef.current = 0;
    velocityXRef.current = 0;
  };

  const handleToggleAutoRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoRotating((prev) => !prev);
  };

  return (
    <div
      className="relative w-full py-8 sm:py-12 flex items-center justify-center select-none"
      style={{ perspective: '1400px' }}
    >
      {/* Ambient Multi-Hue Royal Backlight (Diffuse Organic Gradient, Zero Circular Frame) */}
      <div className="absolute w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-3xl bg-gradient-to-tr from-green/25 via-navy/20 to-amber-300/30 blur-3xl pointer-events-none transform -translate-y-4 animate-pulse duration-[4000ms]" />
      <div className="absolute w-64 h-64 rounded-3xl bg-emerald-400/15 blur-2xl pointer-events-none translate-x-16 translate-y-12" />

      {/* 3D Heraldic Plaque Container */}
      <div
        ref={containerRef}
        onMouseMove={handlePlaqueMouseMove}
        onMouseEnter={handlePlaqueMouseEnter}
        onMouseLeave={handlePlaqueMouseLeave}
        className="relative w-full max-w-[450px] sm:max-w-[480px] min-h-[490px] sm:min-h-[520px] rounded-[38px] p-5 sm:p-7 transition-transform duration-300 ease-out flex flex-col justify-between"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${plaqueRotX}deg) rotateY(${plaqueRotY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          boxShadow: isHovered
            ? '0 40px 80px -15px rgba(23, 59, 120, 0.45), 0 25px 45px -10px rgba(36, 139, 75, 0.35), 0 0 35px rgba(212, 175, 55, 0.35)'
            : '0 30px 65px -15px rgba(23, 59, 120, 0.32), 0 18px 35px -10px rgba(36, 139, 75, 0.22), 0 0 20px rgba(212, 175, 55, 0.15)',
        }}
      >
        {/* Layer 1: Sculpted Beveled Crystalline Plaque */}
        <div
          className="absolute inset-0 rounded-[38px] bg-gradient-to-b from-white/95 via-slate-50/90 to-cream/95 backdrop-blur-2xl border-2 border-amber-400/80 shadow-[inset_0_2px_4px_rgba(255,255,255,1),inset_0_-4px_10px_rgba(23,59,120,0.08)]"
          style={{ transform: 'translateZ(0px)' }}
        />

        {/* Layer 2: Metallic Gold Inlay Filigree Border */}
        <div
          className="absolute inset-2.5 sm:inset-3 rounded-[30px] border border-amber-300/60 pointer-events-none"
          style={{ transform: 'translateZ(12px)' }}
        />

        {/* Layer 3: Dynamic Specular Sheen */}
        <div
          className="absolute inset-0 rounded-[38px] pointer-events-none transition-opacity duration-300 overflow-hidden"
          style={{
            transform: 'translateZ(18px)',
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.15) 35%, rgba(255, 255, 255, 0) 65%)`,
            opacity: glarePosition.opacity,
          }}
        />

        {/* Layer 4: Top Authority Badges (Clean rounded badges, no circular enclosure) */}
        <div
          className="relative flex items-center justify-between z-20 pointer-events-none mb-2"
          style={{ transform: 'translateZ(38px)' }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-navy border border-amber-400/70 text-[10px] sm:text-[11px] font-bold shadow-md tracking-wider uppercase">
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>ESTD 2026 • AYUSH CERTIFIED</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-green/10 text-green-dark border border-green/30 text-[10px] sm:text-[11px] font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-green" />
            <span>NCH Registered</span>
          </span>
        </div>

        {/* Layer 5: CENTERPIECE 360-DEGREE ROTATING 3D LOGO (Pure Freestanding Logo, No Circular Medallion/Coin) */}
        <div
          className="relative w-full flex flex-col items-center justify-center my-auto py-4 z-10"
          style={{ transform: 'translateZ(55px)', transformStyle: 'preserve-3d' }}
        >
          {/* Subtle Diffuse Grounding Shadow (No Circle) */}
          <div className="absolute w-60 h-44 sm:w-72 sm:h-52 rounded-2xl bg-gradient-to-b from-navy/15 via-green/15 to-amber-300/20 blur-2xl transform translate-y-6 pointer-events-none" />

          {/* Continuous 360° Rotatable 3D Logo Object (Freestanding Pure Logo in 3D Depth) */}
          <div
            ref={logo3dRef}
            onPointerDown={handleLogoPointerDown}
            onPointerMove={handleLogoPointerMove}
            onPointerUp={handleLogoPointerUp}
            onPointerCancel={handleLogoPointerUp}
            className={`relative w-56 h-48 sm:w-64 sm:h-56 touch-none select-none flex items-center justify-center transition-shadow ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(0deg) rotateY(0deg)',
              willChange: 'transform',
            }}
            title="360° Rotating 3D Clinic Logo • Drag to spin freely"
          >
            {/* Physical Extrusion Depth Layer - Deepest Ambient Shadow (-12px) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: 'translateZ(-12px)' }}
            >
              <img
                src={logoUrl}
                alt=""
                className="w-full h-full object-contain filter blur-xs brightness-50 opacity-30 select-none"
              />
            </div>

            {/* Physical Extrusion Depth Layer - Rear Bevel (-6px) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: 'translateZ(-6px)' }}
            >
              <img
                src={logoUrl}
                alt=""
                className="w-full h-full object-contain filter brightness-70 contrast-125 opacity-60 select-none"
              />
            </div>

            {/* Physical Extrusion Depth Layer - Mid Core (0px) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: 'translateZ(0px)' }}
            >
              <img
                src={logoUrl}
                alt=""
                className="w-full h-full object-contain filter brightness-85 opacity-80 drop-shadow-[0_4px_8px_rgba(23,59,120,0.3)] select-none"
              />
            </div>

            {/* Physical Extrusion Depth Layer - Forward Accent (+6px) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: 'translateZ(6px)' }}
            >
              <img
                src={logoUrl}
                alt=""
                className="w-full h-full object-contain filter brightness-95 opacity-90 drop-shadow-[0_8px_16px_rgba(23,59,120,0.35)] select-none"
              />
            </div>

            {/* FRONT FACE OF 3D LOGO (+12px translateZ) */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: 'translateZ(12px)',
                backfaceVisibility: 'hidden',
              }}
            >
              <img
                src={logoUrl}
                alt="Anika Homeopathic Clinic Official Logo"
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center center',
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_16px_25px_rgba(23,59,120,0.4)] drop-shadow-[0_6px_10px_rgba(36,139,75,0.3)] transition-transform duration-300 select-none"
              />
            </div>

            {/* BACK FACE OF 3D LOGO (+12px translateZ with rotateY(180deg)) */}
            {/* When rotated 180deg, this face is perfectly right-side up facing the viewer! */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: 'rotateY(180deg) translateZ(12px)',
                backfaceVisibility: 'hidden',
              }}
            >
              <img
                src={logoUrl}
                alt="Anika Homeopathic Clinic Official Logo"
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center center',
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_16px_25px_rgba(23,59,120,0.4)] drop-shadow-[0_6px_10px_rgba(36,139,75,0.3)] transition-transform duration-300 select-none"
              />
            </div>
          </div>

          {/* Title Inscription Engraved on Plaque */}
          <div
            className="mt-4 text-center pointer-events-none"
            style={{ transform: 'translateZ(30px)' }}
          >
            <h2 className="text-sm sm:text-base font-serif font-black text-navy tracking-tight drop-shadow-xs">
              ANIKA HOMEOPATHIC CLINIC
            </h2>
            <p className="text-[10px] sm:text-[11px] font-semibold text-green uppercase tracking-widest mt-0.5">
              Hahnemannian Classical Cure • Bakhri
            </p>
          </div>

          {/* Sleek Interactive 360° Spin Controls Bar (Clean rounded-xl, no circular pill) */}
          <div
            className="mt-3 flex items-center justify-center gap-2 z-30"
            style={{ transform: 'translateZ(42px)' }}
          >
            <button
              type="button"
              onClick={handleToggleAutoRotate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-navy text-[11px] font-semibold border border-amber-300/70 shadow-xs transition-colors cursor-pointer"
              title={isAutoRotating ? 'Pause continuous rotation' : 'Resume continuous rotation'}
            >
              {isAutoRotating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pause 360°</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-green fill-green" />
                  <span>Auto Spin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetRotation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-navy text-[11px] font-semibold border border-navy/15 shadow-xs transition-colors cursor-pointer"
              title="Reset rotation angle facing front"
            >
              <RotateCcw className="w-3.5 h-3.5 text-navy/60" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Layer 6: Bottom Floating Credentials Bar (Rounded-xl badges, no circles) */}
        <div
          className="relative flex items-center justify-between text-[10px] sm:text-[11px] pointer-events-none mt-2"
          style={{ transform: 'translateZ(48px)' }}
        >
          <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-navy/10 shadow-md text-navy font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green" />
            <span>Single Simillimum</span>
          </div>

          <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-navy/10 shadow-md text-navy font-semibold flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-green" />
            <span>Govt. College Leadership</span>
          </div>
        </div>
      </div>

      {/* Interactive Micro-badge footer (Clean rounded-xl, no circular pill) */}
      <div className="absolute -bottom-1 text-center pointer-events-none">
        <p className="text-[10px] sm:text-[11px] font-semibold text-navy/70 bg-white/90 backdrop-blur-xs px-4 py-1.5 rounded-xl border border-amber-300/40 shadow-xs flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin duration-[6000ms]" />
          <span>360° Continuously Rotating • Drag or swipe logo to spin freely</span>
        </p>
      </div>
    </div>
  );
};
