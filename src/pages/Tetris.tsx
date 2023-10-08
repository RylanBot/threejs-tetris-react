/* 游戏整体渲染逻辑 */

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { Vector3 } from 'three';
import { CameraDirectionUpdater } from '../components/CameraDirectionUpdater';
import MiniAxes from '../components/MiniAxes';
import { Block, FallenCubes, Tetrimino, Tetriminos, TetriminoType } from '../components/Tetrimino';
import ThreeSidedGrid from '../components/ThreeSidedGrid';

import GitHubLogo from '../assets/images/github.svg';

// 随机选择方块类型（Multi-bag Random Generator）
let bag: TetriminoType[] = [];
const shuffleArray = (array: TetriminoType[]): TetriminoType[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
const fillBag = () => {
    const tetriminos = Object.keys(Tetriminos) as TetriminoType[];
    for (let i = 0; i < 3; i++) { // 每种方块三个
        bag.push(...tetriminos);
    }
    shuffleArray(bag);
}
const getRandomTetrimino = (): TetriminoType => {
    if (bag.length === 0) {
        fillBag();
    }
    return bag.pop()!;
};

// 随机旋转方块
const rotateRandomly = (blocks: Block[]): Block[] => {
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

// 获取方块的边界
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

// 获取下落位置
const getRandomPosition = (rotatedBlocks: Block[]): [number, number, number] => {
    const bounds = getBounds(rotatedBlocks);

    const xRange = 5 - (bounds.maxX - bounds.minX);
    const zRange = 5 - (bounds.maxZ - bounds.minZ);

    const x = Math.floor(Math.random() * xRange) - bounds.minX + 0.5;
    const y = 11.5 - bounds.maxY;
    const z = Math.floor(Math.random() * zRange) - bounds.minZ + 0.5;

    return [x, y, z];
}

const Tetris: React.FC = () => {

    /* ----- 相关变量 ----- */
    // 初始化相关
    const [type, setType] = useState<TetriminoType | null>(null);
    const [position, setPosition] = useState<[number, number, number] | null>(null);
    const [blocks, setBlocks] = useState<Block[] | null>(null);
    const [nextType, setNextType] = useState<TetriminoType | null>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const fallIntervalRef = useRef<number | undefined>();

    // 获取当前旋转角度
    const controlsRef = useRef<any>(null);

    // 获取相机角度
    const [cameraDirection, setCameraDirection] = React.useState(new Vector3());

    // 已下落方块集合
    const [gridState, setGridState] = useState<(string | null)[][][]>(() => {
        const initialState = [];
        for (let i = 0; i < 6; i++) {
            const xLayer = [];
            for (let j = 0; j < 6; j++) {
                const yLayer = new Array(12).fill(null);
                xLayer.push(yLayer);
            }
            initialState.push(xLayer);
        }
        return initialState;
    });

    /* ----- 相关逻辑 ----- */
    // 生成新方块
    const generateNewTetrimino = () => {
        // 如果游戏已结束，直接返回
        if (gameOver) return;

        if (!nextType) return;
        setType(nextType); // 使用预测的方块作为当前方块

        const newBlocks = rotateRandomly(Tetriminos[nextType].blocks);
        const newPosition = getRandomPosition(newBlocks);

        setBlocks(newBlocks);
        setPosition(newPosition);
        startFall();

        const newNextType = getRandomTetrimino(); // 预测下一个方块
        setNextType(newNextType);
    };

    // 开始游戏
    const startGame = () => {
        setGameStarted(true);

        const newType = getRandomTetrimino();
        const newBlocks = rotateRandomly(Tetriminos[newType].blocks);
        const newPosition = getRandomPosition(newBlocks);

        setType(newType);
        setBlocks(newBlocks);
        setPosition(newPosition);
        setNextType(getRandomTetrimino());

        setIsPaused(false);
    };

    // 结束游戏
    const resetGame = () => {
        setType(null);
        setBlocks(null);
        setPosition(null);
        setNextType(null);
        setScore(0);

        // 清空已落下的方块
        setGridState(prevState => {
            const newState = [...prevState];
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 6; j++) {
                    newState[i][j].fill(null);
                }
            }
            return newState;
        });

        setIsPaused(false);
        setGameStarted(false);
        setGameOver(false);

        // 停止方块下落
        if (fallIntervalRef.current) {
            clearInterval(fallIntervalRef.current);
        }
    };

    // 暂停游戏
    const togglePause = () => {
        setIsPaused(prevIsPaused => !prevIsPaused);
    };

    // 方块开始下落
    const startFall = () => {
        // 检查是否所有必要的变量都已定义
        if (!position || !blocks || !type) return;

        if (isPaused || gameOver) return;

        if (fallIntervalRef.current) {
            clearInterval(fallIntervalRef.current);
        }

        fallIntervalRef.current = setInterval(() => {
            let [x, y, z] = position;
            let newY = y - 1;  // 预测的新位置
            const predictedBlocksPosition = blocks.map(block => ({ x: block.x + x, y: block.y + newY, z: block.z + z }));

            if (isValidPosition(predictedBlocksPosition)) {
                setPosition([x, newY, z]);  // 如果预测的新位置有效，则更新位置   
            } else {
                addBlockToGrid(blocks.map(block => ({ x: block.x + x, y: block.y + y, z: block.z + z })), Tetriminos[type].color); // 使用当前位置
                generateNewTetrimino();
            }
        }, 1000) as unknown as number;
    };

    // 限制方块运动边界
    const isValidPosition = (newBlocks: Block[]) => {
        for (let { x, y, z } of newBlocks) {
            x = Math.floor(x);
            y = Math.floor(y);
            z = Math.floor(z);

            if (
                x < 0 || x >= 6 ||
                z < 0 || z >= 6 ||
                y < 0 || y >= 12 ||
                gridState[x][z][y] !== null
            ) {
                return false;
            }
        }

        return true;
    };

    // 添加当前方块到已下落的方块集合
    const addBlockToGrid = (blocksPosition: Block[], color: string) => {

        const newGridState = [...gridState];

        for (let block of blocksPosition) {
            const x = Math.floor(block.x);
            const y = Math.floor(block.y);
            const z = Math.floor(block.z);
            newGridState[x][z][y] = color;
        }
        setGridState(newGridState);

        setScore(prevScore => prevScore + 2);  // 成功下降就+2

        for (let y = 0; y < 12; y++) {
            if (isRowFull(y)) {
                clearRow(y);
            }
        }

        // 检查顶层是否已满
        for (let x = 0; x < 6; x++) {
            for (let z = 0; z < 6; z++) {
                if (newGridState[x][z][11] !== null) {
                    setGameOver(true);
                    break;
                }
            }
        }

    };

    // 操控位置移动
    const handleKeyDown = (e: KeyboardEvent) => {

        // 如果游戏暂停，不执行任何操作
        if (isPaused) return;

        if (!position || !blocks) return;

        let [x, y, z] = position;

        let newBlocks = blocks;

        const azimuthAngle = controlsRef.current?.getAzimuthalAngle() || 0;

        switch (e.key.toUpperCase()) {

            case 'W':
                if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
                    z -= 1;
                } else {
                    x -= 1;
                }
                break;
            case 'S':
                if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
                    z += 1;
                } else {
                    x += 1;
                }
                break;
            case 'A':
                if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
                    x -= 1;
                } else {
                    z += 1;
                }
                break;
            case 'D':
                if (azimuthAngle >= 0 && azimuthAngle < Math.PI / 4) {
                    x += 1;
                } else {
                    z -= 1;
                }
                break;
            // 沿x轴旋转
            case 'Q':
                newBlocks = blocks.map(block => ({ x: block.x, y: block.z, z: -block.y }));
                break;
            // 沿y轴旋转
            case 'E':
                newBlocks = blocks.map(block => ({ x: -block.z, y: block.y, z: block.x }));
                break;
            //沿z轴旋转
            case 'R':
                newBlocks = blocks.map(block => ({ x: block.y, y: -block.x, z: block.z }));
                break;
            case ' ':
                hardDrop();
                return;
            default:
                break;
        }

        const newBlocksPosition = newBlocks.map(block => ({ x: block.x + x, y: block.y + y, z: block.z + z }));
        if (isValidPosition(newBlocksPosition)) {
            setPosition([x, y, z]);
            setBlocks(newBlocks);
            startFall();
        }
    };

    // 硬降落（直接到达底部）
    const hardDrop = () => {

        if (gameOver) return;

        if (!position || !blocks || !type) return;
        let [x, y, z] = position;

        while (true) {
            let newY = y - 1;
            const predictedBlocksPosition = blocks.map(block => ({ x: block.x + x, y: block.y + newY, z: block.z + z }));
            if (!isValidPosition(predictedBlocksPosition)) {
                break;
            }
            y = newY;
        }

        addBlockToGrid(blocks.map(block => ({ x: block.x + x, y: block.y + y, z: block.z + z })), Tetriminos[type].color);
        generateNewTetrimino();
    };

    // 检查某一行是否已满
    const isRowFull = (y: number): boolean => {
        for (let x = 0; x < 6; x++) {
            for (let z = 0; z < 6; z++) {
                if (gridState[x][z][y] === null) {
                    return false;
                }
            }
        }
        return true;
    };

    // 清空已满的一行
    const clearRow = (y: number) => {
        const newGridState = [...gridState];
        for (let i = y; i < 11; i++) {
            for (let x = 0; x < 6; x++) {
                for (let z = 0; z < 6; z++) {
                    newGridState[x][z][i] = newGridState[x][z][i + 1];
                }
            }
        }
        for (let x = 0; x < 6; x++) {
            for (let z = 0; z < 6; z++) {
                newGridState[x][z][11] = null;
            }
        }
        setGridState(newGridState);
        setScore(prevScore => prevScore + 10);
    };

    useEffect(() => {
        const cleanupFall = () => {
            if (fallIntervalRef.current) {
                clearInterval(fallIntervalRef.current);
            }
        };

        if (gameStarted && !isPaused) {
            startFall();
            window.addEventListener('keydown', handleKeyDown);
        } else {
            cleanupFall();
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            cleanupFall();
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [position, blocks, gameStarted, isPaused]);


    return (
        <>
            {/* 页面标题 */}
            <div className="game-header">
                <a href="https://github.com/RylanBot/threejs-tetris-react"
                    target="_blank"
                    rel="noopener noreferrer">
                    <img src={GitHubLogo} alt="Project Repository" className="github-logo" />
                </a>

                <h1 className='title-3d'>3D &nbsp;Tetris</h1>

                <div className='game-buttons-container'>
                    <button type="button" onClick={gameStarted ? resetGame : startGame} className="button-3d button-3d-start">
                        {gameStarted ? "Quit" : "Start"}
                    </button>
                    <button
                        type="button"
                        onClick={togglePause}
                        className={`button-3d button-3d-pause ${gameStarted && !gameOver ? '' : 'hidden'}`}
                    >
                        {isPaused ? "Continue" : "Pause"}
                    </button>
                </div>
            </div>

            {/* 游戏主体 */}
            <div className='game-container'>
                {gameOver && (
                    <div className="game-over-container">
                        <h1>Game Over</h1>
                    </div>
                )}

                {/* 游戏内容 */}
                <div className='game-canvas-left'>
                    <Canvas style={{ width: '100%', height: '100%' }}>
                        <ambientLight intensity={2} />
                        <OrbitControls
                            ref={controlsRef}
                            target={[2, 6, 0]}
                            minDistance={20} maxDistance={20}
                            minPolarAngle={0} maxPolarAngle={Math.PI / 2}
                            minAzimuthAngle={0} maxAzimuthAngle={Math.PI / 2}
                            enabled={!isPaused}
                        />
                        <CameraDirectionUpdater setDirection={setCameraDirection} />


                        <ThreeSidedGrid />
                        {type && position && blocks && (
                            <Tetrimino type={type} position={position} blocks={blocks} />
                        )}
                        <FallenCubes gridState={gridState} />
                    </Canvas>
                </div>

                {/* 其余信息 */}
                <div className='game-canvas-right'>
                    <Canvas style={{ width: '100%', height: '100%' }}>
                        <ambientLight />

                        {nextType && (
                            <>
                                <Html position={[-0.75, 1.75, 0]} className='next-block-label'>
                                    <h2>Next:</h2>
                                </Html>
                                <Tetrimino
                                    type={nextType}
                                    position={[0.4, 1.6, 0]}
                                    blocks={Tetriminos[nextType].blocks}
                                    scale={0.15} />

                                <Html position={[-0.75, 0.75, 0]} className='score-label'>
                                    <h2>Score: &nbsp; {score}</h2>
                                </Html>
                            </>
                        )}
                        <Html position={[-0.85, 0.15, 0]} className='instructions-label'>
                            <ul>
                                <li><strong>Drag:</strong> <span>Mouse</span></li>
                                <li><strong>Rotate:</strong>
                                    <ul>
                                        <li><strong>X-axis:</strong> Q</li>
                                        <li><strong>Y-axis:</strong> E</li>
                                        <li><strong>Z-axis:</strong> R</li>
                                    </ul>
                                </li>
                                <li><strong>Hard Drop:</strong> <span>Space</span></li>
                            </ul>
                        </Html>
                        <MiniAxes cameraDirection={cameraDirection} position={[0, -2, 0]} />

                    </Canvas>
                </div>
            </div>

        </>

    );
}

export default Tetris;
