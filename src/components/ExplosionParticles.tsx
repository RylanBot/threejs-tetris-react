import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, PointsMaterial, AdditiveBlending } from 'three';
import { Stars } from '@react-three/drei';

interface ExplosionParticlesProps {
  position: [number, number, number];
  color: string;
  onComplete: () => void;
  active: boolean;
}

interface ParticleData {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  life: number;
  maxLife: number;
  size: number;
}

const ExplosionParticles: React.FC<ExplosionParticlesProps> = ({ position, color, onComplete, active }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const animationTimeRef = useRef(0);
  const isActiveRef = useRef(false);

  const particleCount = 200;

  useEffect(() => {
    if (active && !isActiveRef.current) {
      isActiveRef.current = true;
      animationTimeRef.current = 0;
      
      const particles: ParticleData[] = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.5;
        const phi = Math.random() * Math.PI;
        
        const speed = 0.1 + Math.random() * 0.3;
        const life = 0.8 + Math.random() * 1.2;
        
        particles.push({
          position: {
            x: position[0] + radius * Math.sin(phi) * Math.cos(angle),
            y: position[1] + radius * Math.cos(phi),
            z: position[2] + radius * Math.sin(phi) * Math.sin(angle)
          },
          velocity: {
            x: speed * Math.sin(phi) * Math.cos(angle),
            y: speed * Math.cos(phi) + 0.05,
            z: speed * Math.sin(phi) * Math.sin(angle)
          },
          life: life,
          maxLife: life,
          size: 0.05 + Math.random() * 0.1
        });
      }
      
      particlesRef.current = particles;
      
      if (pointsRef.current && pointsRef.current.geometry) {
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const baseColor = new Color(color);
        
        for (let i = 0; i < particleCount; i++) {
          const particle = particles[i];
          
          positions[i * 3] = particle.position.x;
          positions[i * 3 + 1] = particle.position.y;
          positions[i * 3 + 2] = particle.position.z;
          
          colors[i * 3] = baseColor.r;
          colors[i * 3 + 1] = baseColor.g;
          colors[i * 3 + 2] = baseColor.b;
          
          sizes[i] = particle.size;
        }
        
        pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        pointsRef.current.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      }
    }
  }, [active, position, color]);

  useFrame((state, delta) => {
    if (!isActiveRef.current || !pointsRef.current || !pointsRef.current.geometry) return;
    
    animationTimeRef.current += delta;
    
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.size.array as Float32Array;
    
    const baseColor = new Color(color);
    let allDead = true;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = particlesRef.current[i];
      
      if (particle.life > 0) {
        allDead = false;
        
        particle.velocity.y -= 0.005;
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.position.z += particle.velocity.z;
        particle.life -= delta;
        
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
        
        const lifeRatio = Math.max(0, particle.life / particle.maxLife);
        const brightness = 0.5 + lifeRatio * 0.5;
        
        colors[i * 3] = baseColor.r * brightness;
        colors[i * 3 + 1] = baseColor.g * brightness;
        colors[i * 3 + 2] = baseColor.b * brightness;
        
        sizes[i] = particle.size * lifeRatio;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
    
    if (allDead && isActiveRef.current) {
      isActiveRef.current = false;
      onComplete();
    }
  });

  if (!active && !isActiveRef.current) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.1}
        vertexColors
        blending={AdditiveBlending}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

export default ExplosionParticles;
