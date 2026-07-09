"use client";

import { useState, useEffect } from "react";

// ---------- WebGL Detection ----------
function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // Dispose immediately
    if (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext) {
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    }
    return true;
  } catch {
    return false;
  }
}

// ---------- CSS Fallback Background ----------
function CSSFallbackBackground() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      {/* Large floating orb – green */}
      <div
        className="absolute w-[420px] h-[420px] rounded-full opacity-[0.18] blur-[100px]"
        style={{
          background: "radial-gradient(circle, #68BA7F 0%, transparent 70%)",
          top: "10%",
          right: "15%",
          animation: "floatOrb1 12s ease-in-out infinite",
        }}
      />

      {/* Medium floating orb – gold */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full opacity-[0.12] blur-[80px]"
        style={{
          background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)",
          bottom: "20%",
          left: "10%",
          animation: "floatOrb2 15s ease-in-out infinite",
        }}
      />

      {/* Small floating orb – teal */}
      <div
        className="absolute w-[200px] h-[200px] rounded-full opacity-[0.15] blur-[60px]"
        style={{
          background: "radial-gradient(circle, #4ECDC4 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "floatOrb3 10s ease-in-out infinite",
        }}
      />

      {/* Subtle ring element */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full border border-[#68BA7F]/10 opacity-50"
        style={{
          top: "30%",
          left: "55%",
          transform: "translate(-50%, -50%)",
          animation: "spinRing 25s linear infinite",
        }}
      />
      <div
        className="absolute w-[250px] h-[250px] rounded-full border border-[#D4AF37]/8 opacity-40"
        style={{
          top: "35%",
          left: "55%",
          transform: "translate(-50%, -50%)",
          animation: "spinRing 20s linear infinite reverse",
        }}
      />

      {/* Inline keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-30px, 20px) scale(1.05); }
          50% { transform: translate(20px, -30px) scale(0.95); }
          75% { transform: translate(-10px, -20px) scale(1.02); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -20px) scale(1.08); }
          66% { transform: translate(-20px, 30px) scale(0.92); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-45%, -55%) scale(1.15); }
        }
        @keyframes spinRing {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      ` }} />
    </div>
  );
}

// ---------- WebGL 3D Background (lazy-loaded) ----------
function WebGL3DBackground() {
  // Dynamically import heavy Three.js dependencies only when WebGL is confirmed available
  const [ThreeScene, setThreeScene] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadScene = async () => {
      try {
        const [
          { Canvas, useFrame },
          { Float, Environment, ContactShadows },
          THREE,
        ] = await Promise.all([
          import("@react-three/fiber"),
          import("@react-three/drei"),
          import("three"),
        ]);

        // Build the scene component inline
        function AbstractShape({ position, rotation, scale, color }: any) {
          const meshRef = { current: null as THREE.Mesh | null };

          return (
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
              <mesh
                ref={(el: any) => { meshRef.current = el; }}
                position={position}
                scale={scale}
                castShadow
                receiveShadow
              >
                <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                <meshStandardMaterial
                  color={color}
                  metalness={0.8}
                  roughness={0.2}
                  envMapIntensity={1}
                />
              </mesh>
            </Float>
          );
        }

        function FloatingRing({ position, rotation, scale, color }: any) {
          return (
            <Float speed={2} rotationIntensity={2} floatIntensity={1}>
              <mesh
                position={position}
                rotation={rotation}
                scale={scale}
                castShadow
                receiveShadow
              >
                <torusGeometry args={[1.5, 0.05, 16, 100]} />
                <meshStandardMaterial
                  color={color}
                  metalness={1}
                  roughness={0.1}
                  emissive={color}
                  emissiveIntensity={0.2}
                />
              </mesh>
            </Float>
          );
        }

        function Scene() {
          return (
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#68BA7F" />
              <AbstractShape position={[3, 1, -2]} rotation={[0, 0, 0]} scale={0.8} color="#68BA7F" />
              <AbstractShape position={[-3, -2, -3]} rotation={[Math.PI / 4, 0, 0]} scale={0.5} color="#1E1E1E" />
              <FloatingRing position={[0, 0, -4]} rotation={[Math.PI / 2, 0, 0]} scale={1.5} color="#68BA7F" />
              <Environment preset="city" />
              <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
            </Canvas>
          );
        }

        if (!cancelled) {
          setThreeScene(() => Scene);
        }
      } catch (err) {
        console.warn("Failed to load 3D background, using CSS fallback:", err);
        if (!cancelled) {
          setThreeScene(null);
        }
      }
    };

    // Delay slightly so the main content paints first
    const timer = setTimeout(loadScene, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!ThreeScene) {
    // Show CSS fallback while Three.js is loading (or if it failed)
    return <CSSFallbackBackground />;
  }

  return (
    <div className="absolute inset-0 w-full h-full -z-10 opacity-70 pointer-events-none">
      <ThreeScene />
    </div>
  );
}

// ---------- Main Export ----------
export default function GlobalBackground() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  // During SSR / initial check, render nothing
  if (webglSupported === null) {
    return <div className="absolute inset-0 w-full h-full -z-10 bg-transparent pointer-events-none" />;
  }

  // If WebGL is unavailable, use the premium CSS fallback
  if (!webglSupported) {
    return <CSSFallbackBackground />;
  }

  // WebGL is available – render the 3D scene
  return <WebGL3DBackground />;
}
