
export type AnnotationType = 'box3d' | 'box2d'

export interface Point3D {
  x: number;
  y: number;
  z: number;
}
export interface Point2D {
  x: number;
  y: number
}
export interface Quaternion{
  x: number;
  y: number;
  z: number;
  w: number;
}
export interface AnnotationResult {
  type: AnnotationType;
  position: Point3D;
  length: number;
  width : number;
  height : number;
  orientation: Quaternion
}

export interface Frame {
  id: string;
  index: number;
  pcd: string;
  frontImage: string;
  leftImage: string;

  annotations: AnnotationResult[]
}

export interface Clip {
  id: string;
  frameSize: number;
  frames: Frame[];
}
