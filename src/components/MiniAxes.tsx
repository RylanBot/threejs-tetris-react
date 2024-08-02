import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { ArrowHelper, Color, Group, Vector3 } from 'three';

/**
 * 迷你坐标轴
 */
interface MiniAxesProps {
    position?: [number, number, number];
    cameraDirection: Vector3;
}

const MiniAxes: React.FC<MiniAxesProps> = ({ position = [0, 0, 0], cameraDirection }) => {
    const { scene } = useThree();
    const groupRef = useRef<Group>(new Group());
    const scaleValue = 0.4;
    const axisLength = 2;

    const xColor = "indianred";
    const yColor = "forestgreen";

    groupRef.current.scale.set(scaleValue, scaleValue, scaleValue);
    groupRef.current.position.set(...position);

    const setupArrows = () => {
        const arrows: ArrowHelper[] = [];

        const createArrow = (dir: Vector3, origin: Vector3, color: Color) => {
            const arrow = new ArrowHelper(dir, origin, axisLength, color);
            arrows.push(arrow);
            groupRef.current.add(arrow);
        };

        // 正负X轴
        createArrow(new Vector3(1, 0, 0), new Vector3(0, 0, 0), new Color(xColor));
        createArrow(new Vector3(-1, 0, 0), new Vector3(0, 0, 0), new Color(xColor));

        // 正负Z轴
        createArrow(new Vector3(0, 0, 1), new Vector3(0, 0, 0), new Color(yColor));
        createArrow(new Vector3(0, 0, -1), new Vector3(0, 0, 0), new Color(yColor));
    };

    const cleanupArrows = () => {
        groupRef.current.children.forEach(child => groupRef.current?.remove(child));
        scene.remove(groupRef.current);
    };

    useEffect(() => {
        setupArrows();
        scene.add(groupRef.current);

        return () => {
            cleanupArrows();
        };
    }, [scene]);

    // 每一帧渲染时随着传入的方向一起旋转
    useFrame(() => {
        const azimuthalAngle = Math.atan2(cameraDirection.x, cameraDirection.z);
        groupRef.current.rotation.set(0, azimuthalAngle, 0);
    });

    return (
        <group ref={groupRef}>
            <Html position={[axisLength, 0, 0]} center>
                <div className="axis-label">A</div>
            </Html>
            <Html position={[-axisLength, 0, 0]} center>
                <div className="axis-label">D</div>
            </Html>
            <Html position={[0, 0, axisLength]} center>
                <div className="axis-label">W</div>
            </Html>
            <Html position={[0, 0, -axisLength]} center>
                <div className="axis-label">S</div>
            </Html>
        </group>
    );
};

export default MiniAxes;