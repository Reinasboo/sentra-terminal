"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

export default function TradingGlobe3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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
    camera.position.z = 2.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create globe
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x1f2937,
      wireframe: false,
      emissive: 0x111827,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Create glowing network of trading nodes
    const positionsArray: number[] = [];
    const colors: number[] = [];

    for (let i = 0; i < 50; i++) {
      const lat = (Math.random() - 0.5) * Math.PI;
      const lng = (Math.random() - 0.5) * Math.PI * 2;

      const x = Math.cos(lat) * Math.cos(lng);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lng);

      positionsArray.push(x, y, z);

      // Random color based on trade type
      const r = Math.random() < 0.5 ? 1 : 0.2; // Red or blue
      const g = Math.random() < 0.5 ? 1 : 0.2;
      const b = Math.random() < 0.5 ? 1 : 0.2;

      colors.push(r, g, b);
    }

    const nodgeometry = new THREE.BufferGeometry();
    nodgeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positionsArray), 3));
    nodgeometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));

    const nodMaterial = new THREE.PointsMaterial({
      size: 0.1,
      sizeAttenuation: true,
      vertexColors: true,
    });

    const nodes = new THREE.Points(nodgeometry, nodMaterial);
    scene.add(nodes);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // Animation loop
    let frame = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      globe.rotation.y += 0.0005;
      nodes.rotation.y += 0.0003;

      // Animate globe vertices
      const positions = (globeGeometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
      const positionAttribute = globeGeometry.getAttribute("position");
      positionAttribute.needsUpdate = true;

      frame++;
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-lg font-bold mb-4">Global Trading Activity Globe</h2>
      <div
        ref={containerRef}
        className="w-full h-96 rounded-lg overflow-hidden bg-dark-bg border border-dark-border"
      />
      <p className="text-xs text-crypto-neutral mt-4">
        Real-time visualization of global trading activity and whale movements
      </p>
    </motion.div>
  );
}
