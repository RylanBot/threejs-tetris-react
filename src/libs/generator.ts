import { Block, TETRIMINOS, type TetriminoType } from "@/components/Tetrimino";
import type { ThreePosition } from "./common";

/**
 * 随机选择方块类型
 * (Multi-bag Random Generator)
 */
export const getRandomTetrimino = (() => {
    let bag: TetriminoType[] = [];

    const shuffleArray = (array: TetriminoType[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const fillBag = () => {
        const tetriminos = Object.keys(TETRIMINOS) as TetriminoType[];
        for (let i = 0; i < 3; i++) {
            bag.push(...tetriminos);
        }
        shuffleArray(bag);
    };

    return function (): TetriminoType {
        if (bag.length === 0) {
            fillBag();
        }
        return bag.pop()!;
    };
})();

/**
 * 随机旋转方块
 */
export function applyRandomRotation(blocks: Block[]) {
    for (let i = 0; i < 5; i++) {
        const rotateTypes = Math.floor(Math.random() * 3);
        switch (rotateTypes) {
            case 0:
                blocks = blocks.map(block => ({ x: block.y, y: -block.x, z: block.z }));
                break;
            case 1:
                blocks = blocks.map(block => ({ x: -block.z, y: block.y, z: block.x }));
                break;
            default:
                break;
        }
    }
    return blocks;
}

/**
 * 随机获取下落位置
 */
export function getRandomPosition(rotatedBlocks: Block[]) {
    const getBounds = (blocks: Block[]) => {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        blocks.forEach(block => {
            minX = Math.min(minX, block.x);
            maxX = Math.max(maxX, block.x);
            minY = Math.min(minY, block.y);
            maxY = Math.max(maxY, block.y);
            minZ = Math.min(minZ, block.z);
            maxZ = Math.max(maxZ, block.z);
        });

        return { minX, maxX, minY, maxY, minZ, maxZ };
    }

    const bounds = getBounds(rotatedBlocks);

    const xRange = 5 - (bounds.maxX - bounds.minX);
    const zRange = 5 - (bounds.maxZ - bounds.minZ);

    const x = Math.floor(Math.random() * xRange) - bounds.minX + 0.5;
    const y = 11.5 - bounds.maxY;
    const z = Math.floor(Math.random() * zRange) - bounds.minZ + 0.5;

    return [x, y, z] as ThreePosition;
}