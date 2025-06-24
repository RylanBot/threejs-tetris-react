import { Box } from '@react-three/drei';
import React from 'react';
import { BoxGeometry } from 'three';

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
  return (
    <group position={[block.x, block.y, block.z]}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color={color} />
      </Box>
      <lineSegments>
        <edgesGeometry attach='geometry' args={[new BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial attach='material' color='black' />
      </lineSegments>
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
export const TetriminoPile: React.FC<{ grid: (string | null)[][][] }> = React.memo(({ grid }) => {
  const tetrimino = [];
  for (let x = 0; x < grid.length; x++) {
    for (let z = 0; z < grid[x].length; z++) {
      for (let y = 0; y < grid[x][z].length; y++) {
        const color = grid[x][z][y];
        if (color) {
          tetrimino.push(
            <Tetrimino
              key={`${x},${y},${z}`}
              block={{ x: x + 0.5, y: y + 0.5, z: z + 0.5 }}
              color={color}
            />
          );
        }
      }
    }
  }

  return <>{tetrimino}</>;
});