import { Box, Environment, ContactShadows, Sparkles, Float } from '@react-three/drei';
import React, { useRef, useEffect, useState } from 'react';
import { BoxGeometry, Color, MeshPhysicalMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

import type { ThreePosition } from '@/libs/common';

export type Block = { x: number; y: number; z: number }

export type TetriminoType = 'OrangeRicky' | 'BlueRicky' | 'ClevelandZ' | 'RhodeIslandZ' | 'Hero' | 'Teewee' | 'Smashboy';

interface TetriminoProps {
  position: ThreePosition;
  type: TetriminoType;
  blocks: Block[];
  scale?: number;
}

interface TetriminoDef {
  blocks: Block[];
  color: string;
}

/**
 * 七种俄罗斯方块
 * - 最高一行的坐标 y = 0（顶部对齐）
 */
export const TETRIMINOS: Record<TetriminoType, TetriminoDef> = {
  /*
      □
    □□□
   */
  OrangeRicky: {
    blocks: [
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 },
      { x: -1, y: -1, z: 0 },
    ],
    color: '#ff9562',
  },
  /*
    □ 
    □□□
   */
  BlueRicky: {
    blocks: [
      { x: -1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 },
      { x: -1, y: -1, z: 0 },
    ],
    color: '#5eaeff',
  },
  /*
    □□
     □□
   */
  ClevelandZ: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: -1, y: -1, z: 0 }
    ],
    color: '#ff8398',
  },
  /*
     □□
    □□
   */
  RhodeIslandZ: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 }
    ],
    color: '#79dd53',
  },
  /*
    □□□□
   */
  Hero: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 }
    ],
    color: '#3fdcd5',
  },
  /*
     □
    □□□
   */
  Teewee: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: -1, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 },
    ],
    color: '#c183ff',
  },
  /*
    □□
    □□
   */
  Smashboy: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 }
    ],
    color: '#ffff4d',
  }
};

/**
 * 单独一个方块
 */
export const Tetrimino: React.FC<{ block: Block; color: string }> = React.memo(({ block, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <group position={[block.x, block.y, block.z]}>
      <Box args={[0.95, 0.95, 0.95]} castShadow receiveShadow>
        <meshPhysicalMaterial 
          color={color}
          metalness={0.3}
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={color}
          emissiveIntensity={0.15}
          reflectivity={0.8}
          envMapIntensity={1.2}
        />
      </Box>
      <lineSegments>
        <edgesGeometry attach='geometry' args={[new BoxGeometry(0.95, 0.95, 0.95)]} />
        <lineBasicMaterial attach='material' color='black' linewidth={2} />
      </lineSegments>
      <Sparkles 
        count={5} 
        scale={0.5} 
        size={4} 
        speed={0.5} 
        opacity={0.6} 
        color={color}
      />
    </group>
  );
});

/**
 * 所有方块构成的整体
 */
export const TetriminoGroup: React.FC<TetriminoProps> = React.memo(({ type, position, blocks, scale = 1 }) => {
  const color = TETRIMINOS[type].color;
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {blocks.map((block, index) => (
        <Tetrimino key={index} block={block} color={color} />
      ))}
      <ContactShadows 
        position={[0, -0.5, 0]} 
        opacity={0.5} 
        scale={10} 
        blur={2.5} 
        far={4.5} 
        color="#000000" 
      />
    </group>
  );
});

/**
 * 带下落动画的方块
 */
interface AnimatedBlockProps {
  block: Block;
  color: string;
  targetY: number;
  onAnimationComplete?: () => void;
}

const AnimatedTetrimino: React.FC<AnimatedBlockProps> = React.memo(({ block, color, targetY, onAnimationComplete }) => {
  const meshRef = useRef<THREE.Group>(null);
  const currentY = useRef(block.y);
  const velocity = useRef(0);
  const isAnimating = useRef(block.y !== targetY);
  const hasCompleted = useRef(false);

  useFrame((state, delta) => {
    if (!meshRef.current || !isAnimating.current) return;

    const targetPos = targetY;
    const currentPos = currentY.current;
    const distance = targetPos - currentPos;

    if (Math.abs(distance) < 0.01) {
      currentY.current = targetPos;
      meshRef.current.position.y = targetPos;
      isAnimating.current = false;
      
      if (!hasCompleted.current && onAnimationComplete) {
        hasCompleted.current = true;
        onAnimationComplete();
      }
      return;
    }

    const gravity = 15;
    velocity.current += gravity * delta;
    velocity.current = Math.min(velocity.current, 8);

    const newY = currentY.current + velocity.current * delta;
    
    if (newY >= targetPos) {
      currentY.current = targetPos;
      meshRef.current.position.y = targetPos;
      isAnimating.current = false;
      
      if (!hasCompleted.current && onAnimationComplete) {
        hasCompleted.current = true;
        onAnimationComplete();
      }
    } else {
      currentY.current = newY;
      meshRef.current.position.y = newY;
    }
  });

  useEffect(() => {
    if (block.y !== targetY) {
      isAnimating.current = true;
      hasCompleted.current = false;
    }
  }, [block.y, targetY]);

  return (
    <group ref={meshRef} position={[block.x, currentY.current, block.z]}>
      <Box args={[0.95, 0.95, 0.95]} castShadow receiveShadow>
        <meshPhysicalMaterial 
          color={color}
          metalness={0.3}
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={color}
          emissiveIntensity={0.15}
          reflectivity={0.8}
          envMapIntensity={1.2}
        />
      </Box>
      <lineSegments>
        <edgesGeometry attach='geometry' args={[new BoxGeometry(0.95, 0.95, 0.95)]} />
        <lineBasicMaterial attach='material' color='black' linewidth={2} />
      </lineSegments>
      <Sparkles 
        count={5} 
        scale={0.5} 
        size={4} 
        speed={0.5} 
        opacity={0.6} 
        color={color}
      />
    </group>
  );
});

/**
 * 已经下落的方块集合（带动画效果）
 */
interface BlockData {
  key: string;
  block: Block;
  color: string;
  targetY: number;
  originalY: number;
}

export const TetriminoPile: React.FC<{ grid: (string | null)[][][] }> = React.memo(({ grid }) => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const pendingBlocksRef = useRef<BlockData[]>([]);
  const gridRef = useRef(grid);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    const newBlocks: BlockData[] = [];
    
    for (let x = 0; x < grid.length; x++) {
      for (let z = 0; z < grid[x].length; z++) {
        let dropDistance = 0;
        
        for (let y = 0; y < grid[x][z].length; y++) {
          const color = grid[x][z][y];
          
          if (color === null) {
            dropDistance++;
          } else {
            const originalY = y;
            const targetY = y - dropDistance;
            
            newBlocks.push({
              key: `${x},${y},${z}`,
              block: { 
                x: x + 0.5, 
                y: originalY + 0.5, 
                z: z + 0.5 
              },
              color: color,
              targetY: targetY + 0.5,
              originalY: originalY
            });
          }
        }
      }
    }

    const hasAnimation = newBlocks.some(b => Math.abs(b.block.y - b.targetY) > 0.01);
    
    if (hasAnimation) {
      setIsAnimating(true);
      pendingBlocksRef.current = newBlocks;
    }

    setBlocks(newBlocks);
  }, [grid]);

  const handleBlockAnimationComplete = () => {
    setIsAnimating(false);
  };

  return (
    <>
      {blocks.map((blockData) => (
        <AnimatedTetrimino
          key={blockData.key}
          block={blockData.block}
          color={blockData.color}
          targetY={blockData.targetY}
          onAnimationComplete={handleBlockAnimationComplete}
        />
      ))}
    </>
  );
});