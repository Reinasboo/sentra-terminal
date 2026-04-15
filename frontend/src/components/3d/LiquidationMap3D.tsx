"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useLiquidationAnalysis } from "@/hooks/useApi";

interface Liquidation3DMapProps {
  symbol?: string;
}

export default function LiquidationMap3D({ symbol = "BTC" }: Liquidation3DMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch real liquidation data from API
  const { data: liquidationData, isLoading, error } = useLiquidationAnalysis(symbol);

  useEffect(() => {
    if (!containerRef.current || isLoading) return;

    // Get liquidation zones from API or show empty state
    const liquidationZones = liquidationData?.liquidation_zones || [];
    
    if (liquidationZones.length === 0) {
      setIsInitialized(true);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create liquidation zones as glowing boxes from REAL API data
    liquidationZones.forEach((zone: any, idx: number) => {
      const height = Math.min((zone.amount || 1000000) / 1e6 / 50, 20);
      const geometry = new THREE.BoxGeometry(10, height, 10);
      const color = zone.side === "LONG" ? 0xef4444 : 0x22c55e;
      const material = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        wireframe: false,
      });
      const box = new THREE.Mesh(geometry, material);
      box.position.y = (idx - Math.floor(liquidationZones.length / 2)) * 15;
      scene.add(box);
    });

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(50, 50, 50);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener("mousedown", (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        scene.rotation.y += deltaX * 0.01;
        scene.rotation.x += deltaY * 0.01;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    renderer.domElement.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.z += 0.0002;
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    setIsInitialized(true);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current?.removeChild(renderer.domElement);
      }
    };
  }, [liquidationData, isLoading]);

  if (isLoading) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-bold mb-4">3D Liquidation Map - {symbol}</h2>
        <div className="w-full h-96 rounded-lg overflow-hidden bg-dark-bg border border-dark-border flex items-center justify-center">
          <p className="text-gray-400">Loading liquidation data from API...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !liquidationData?.liquidation_zones || liquidationData.liquidation_zones.length === 0) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-bold mb-4">3D Liquidation Map - {symbol}</h2>
        <div className="w-full h-96 rounded-lg overflow-hidden bg-dark-bg border border-dark-border flex items-center justify-center">
          <p className="text-gray-400">No liquidation data available for {symbol}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-lg font-bold mb-4">3D Liquidation Map - {symbol}</h2>
      <p className="text-xs text-gray-500 mb-2">Live liquidation zones from API</p>
      <div
        ref={containerRef}
        className="w-full h-96 rounded-lg overflow-hidden bg-dark-bg border border-dark-border"
      />
      <p className="text-xs text-crypto-neutral mt-4">
        🖱️ Drag to rotate | Red=LONG liquidations | Green=SHORT liquidations
      </p>
    </motion.div>
  );
}
