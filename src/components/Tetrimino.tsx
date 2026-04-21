import { Box, Float, Sphere } from '@react-three/drei';
import React, { useMemo } from 'react';
import { BoxGeometry, Color, MeshPhysicalMaterial } from 'three';

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
    color: '#ffc2a8',
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
    color: '#aad4ff',
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
    color: '#ffb8c6',
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
    color: '#c8f4b6',
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
    color: '#b5e8e0',
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
    color: '#e0c4ff',
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
    color: '#fff4b5',
  }
};

/**
 * 单独一个方块
 */
export const Tetrimino: React.FC<{ block: Block; color: string; isClearing?: boolean }> = React.memo(({ block, color, isClearing = false }) => {
  const emissiveColor = useMemo(() => {
    const c = new Color(color);
    return c.multiplyScalar(0.3);
  }, [color]);

  return (
    <group position={[block.x, block.y, block.z]}>
      <Box args={[0.92, 0.92, 0.92]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={emissiveColor}
          emissiveIntensity={isClearing ? 2 : 0.3}
        />
      </Box>
      <Box args={[0.94, 0.94, 0.94]}>
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={0.15}
        />
      </Box>
      {isClearing && (
        <Sphere args={[0.6, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
          />
        </Sphere>
      )}
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
      <mesh receiveShadow position={[0, -0.1, 0]} visible={false}>
      </mesh>
    </group>
  );
});

/**
 * 已经下落的方块集合
 */
export const TetriminoPile: React.FC<{ 
  grid: (string | null)[][][]; 
  clearingRows?: number[];
}> = React.memo(({ grid, clearingRows = [] }) => {
  const tetrimino = [];
  for (let x = 0; x < grid.length; x++) {
    for (let z = 0; z < grid[x].length; z++) {
      for (let y = 0; y < grid[x][z].length; y++) {
        const color = grid[x][z][y];
        if (color) {
          const isClearing = clearingRows.includes(y);
          tetrimino.push(
            <Tetrimino
              key={`${x},${y},${z}`}
              block={{ x: x + 0.5, y: y + 0.5, z: z + 0.5 }}
              color={color}
              isClearing={isClearing}
            />
          );
        }
      }
    }
  }

  return <>{tetrimino}</>;
});