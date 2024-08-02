import { Box } from '@react-three/drei';
import React from 'react';
import { BoxGeometry } from 'three';

export type Block = { x: number; y: number; z: number };

interface TetriminoProps {
  type: TetriminoType;
  position: [number, number, number];
  blocks: Block[];
  scale?: number;
}

interface TetriminoDefinition {
  blocks: Block[];
  color: string;
}

export type TetriminoType = keyof typeof Tetriminos;

/**
 * 七种俄罗斯方块
 */
export const Tetriminos: { [key: string]: TetriminoDefinition } = {
  OrangeRicky: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 1, z: 0 }
    ],
    color: '#ff9562',
  },
  BlueRicky: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: -1, y: 1, z: 0 }
    ],
    color: '#5eaeff',
  },
  ClevelandZ: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: -1, y: -1, z: 0 }
    ],
    color: '#de5f75',
  },
  RhodeIslandZ: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 0, y: -1, z: 0 },
      { x: 1, y: -1, z: 0 }
    ],
    color: '#79dd53',
  },
  Hero: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 2, y: 0, z: 0 }
    ],
    color: '#3fdcd5',
  },
  Teewee: {
    blocks: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }
    ],
    color: '#af60ff',
  },
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
export const Cube: React.FC<{ position: Block; color: string }> = ({ position, color }) => {
  return (
    <group position={[position.x, position.y, position.z]}>
      <Box args={[1, 1, 1]}>
        <meshStandardMaterial color={color} />
      </Box>
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial attach="material" color="black" />
      </lineSegments>
    </group>
  );
};

/**
 * 所有方块构成的整体
 */
export const TetriminoSet: React.FC<TetriminoProps> = ({ type, position, blocks, scale = 1 }) => {
  const tetriminoColor = Tetriminos[type].color;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {blocks.map((block, index) => (
        <Cube key={index} position={block} color={tetriminoColor} />
      ))}
      <mesh receiveShadow position={[0, -0.1, 0]} visible={false}>
      </mesh>
    </group>
  );
};

/**
 * 已经下落的方块集合
 */
export const FallenCubes: React.FC<{ gridState: (string | null)[][][] }> = ({ gridState }) => {
  const cubes = [];

  for (let x = 0; x < gridState.length; x++) {
    for (let z = 0; z < gridState[x].length; z++) {
      for (let y = 0; y < gridState[x][z].length; y++) {
        const color = gridState[x][z][y];
        if (color) {
          cubes.push(
            <Cube
              key={`${x},${y},${z}`}
              position={{ x: x + 0.5, y: y + 0.5, z: z + 0.5 }}
              color={color}
            />
          );
        }
      }
    }
  }

  return <>{cubes}</>;
};