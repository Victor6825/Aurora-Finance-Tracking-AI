import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

type HeroSectionProps = {
  onGetStarted?: () => void;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

type HologramProps = {
  prefersReducedMotion: boolean;
};

function Hologram({ prefersReducedMotion }: HologramProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((_: RootState, delta: number) => {
    if (!groupRef.current) return;
    const speed = prefersReducedMotion ? 0.2 : 1;
    groupRef.current.rotation.y += delta * 0.9 * speed;
    groupRef.current.rotation.x += delta * 0.5 * speed;
    groupRef.current.rotation.z += delta * 0.3 * speed;
  });

  return (
    <group ref={groupRef} rotation={[0.5, 0.2, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.3, 2]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.96}
        />
      </mesh>

      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[1.15, 1.25, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section className="relative w-full border-b border-slate-800/60 bg-slate-950/80">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-emerald-500/5 to-indigo-500/10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-teal-400/10 via-slate-950/0 to-transparent blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:py-24 lg:px-8">
        <div className="order-1 w-full max-w-xl flex-1 lg:order-none">
          <div className="relative overflow-hidden rounded-3xl border border-sky-400/40 bg-slate-950/60 shadow-[0_0_60px_rgba(56,189,248,0.45)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.28),_transparent_55%)] mix-blend-screen" />
            <div className="relative aspect-[4/3]">
              <Canvas
                aria-hidden="true"
                frameloop="always"
                camera={{ position: [0, 0, 4], fov: 42 }}
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
              >
                <color attach="background" args={["#020617"]} />
                <Hologram prefersReducedMotion={prefersReducedMotion} />
              </Canvas>
            </div>
          </div>
        </div>
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-900/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.45)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.95)]" />
              <span>AI-native finance cockpit</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
                Aurora Finance Tracker
              </h1>
              <p className="max-w-xl text-balance text-sm text-slate-300 sm:text-base lg:text-lg">
                Your money, visualized. Your future, optimized. Transform raw
                transactions into living insights, with real-time AI that sees
                patterns long before spreadsheets do.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <motion.button
                type="button"
                onClick={onGetStarted}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_40px_rgba(56,189,248,0.9)] transition-[filter,box-shadow,transform] hover:shadow-[0_0_55px_rgba(56,189,248,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <span>Get Started</span>
                <span className="h-2 w-2 rounded-full bg-slate-950 shadow-[0_0_12px_rgba(15,23,42,0.9)] ring-2 ring-slate-950/70 ring-offset-2 ring-offset-emerald-200" />
              </motion.button>
              <p className="max-w-xs text-xs text-slate-400">
                No noise. No spreadsheets. Just a live hologram of your cash
                flow, risk, and runway.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
