import type { Point2D } from '../Input';

export interface BaseShape extends THREE.Object3D {
  update: (params: any) => void;

  dispose: () => void;

  // getRowAnnotationAttributes(): () => Record<string, any>;
}
