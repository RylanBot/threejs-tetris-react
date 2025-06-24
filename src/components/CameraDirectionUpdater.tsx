import { Vector3 } from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface CameraDirectionUpdaterProps {
    onChange: (dir: Vector3) => void;
}

/**
 * 获取当前 Canvas 的相机角度
 */
const CameraDirectionUpdater: React.FC<CameraDirectionUpdaterProps> = ({ onChange }) => {
    const { camera } = useThree();

    useFrame(() => {
        const direction = new Vector3();
        camera.getWorldDirection(direction);
        onChange(direction);
    });

    return null;
};

export default CameraDirectionUpdater;