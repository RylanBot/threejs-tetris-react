import { useLayoutEffect, useRef } from 'react';

import { Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

import type { PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const PLAYFIELD_CORNERS = [
  [0, 0, 0],
  [6, 0, 0],
  [0, 0, 6],
  [6, 0, 6],
  [0, 12, 0],
  [6, 12, 0],
  [0, 12, 6],
  [6, 12, 6],
].map(([x, y, z]) => new Vector3(x, y, z));

const DESKTOP_FOV = 75;
const DESKTOP_DISTANCE = 20;
const DESKTOP_TARGET = new Vector3(2, 6, 0);
const DESKTOP_POSITION = new Vector3(2, 6, DESKTOP_DISTANCE);

interface CameraViewportUpdaterProps {
  mobile: boolean;
}

/**
 * 随视口切换相机取景参数，确保场地完整可见
 */
const CameraViewportUpdater: React.FC<CameraViewportUpdaterProps> = ({ mobile }) => {
  const { camera, size, controls } = useThree();
  const fittedKey = useRef('');

  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera;
    const orbit = controls as OrbitControlsImpl | null;
    if (!orbit) return;

    const key = `${size.width}x${size.height}`;
    if (!mobile) {
      fittedKey.current = '';
      cam.clearViewOffset();
      cam.fov = DESKTOP_FOV;
      cam.position.copy(DESKTOP_POSITION);
      cam.lookAt(DESKTOP_TARGET);
      cam.updateProjectionMatrix();
      orbit.target.copy(DESKTOP_TARGET);
      orbit.minDistance = DESKTOP_DISTANCE;
      orbit.maxDistance = DESKTOP_DISTANCE;
      orbit.update();
      return;
    }
    if (size.height < 120) return;
    if (fittedKey.current === key) return;

    cam.clearViewOffset();
    cam.fov = 42;
    cam.updateProjectionMatrix();

    const target = new Vector3(3, 5.5, 3);
    const direction = new Vector3(1, 0.78, 1).normalize();
    let low = 10;
    let high = 90;
    for (let i = 0; i < 22; i++) {
      const distance = (low + high) / 2;
      cam.position.copy(target).addScaledVector(direction, distance);
      cam.lookAt(target);
      cam.updateMatrixWorld();
      const fits = PLAYFIELD_CORNERS.every((corner) => {
        const ndc = corner.clone().project(cam);
        return Math.abs(ndc.x) < 0.9 && ndc.y > -0.86 && ndc.y < 0.9 && ndc.z < 1;
      });
      if (fits) high = distance;
      else low = distance;
    }

    cam.position.copy(target).addScaledVector(direction, high);
    cam.lookAt(target);
    cam.updateProjectionMatrix();
    orbit.target.copy(target);
    orbit.minDistance = high;
    orbit.maxDistance = high;
    orbit.update();
    fittedKey.current = key;
  }, [camera, controls, mobile, size.width, size.height]);

  return null;
};

export default CameraViewportUpdater;
