export enum ObjectBusEvent {
  RenderAll = 'RenderAll',
  ClickedBox3D = 'ClickedBox3D',
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}
export interface Point2D {
  x: number;
  y: number;
}
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}
export interface AnnotationResult {
  type: AnnotationType;
  position: Point3D;
  length: number;
  width: number;
  height: number;
  orientation: Quaternion;
}

export interface Frame {
  id: string;
  index: number;
  pcd: string;
  frontImage: string;
  leftImage: string;

  annotations: AnnotationResult[];
}

export interface Project {
  name: string;
  description: string;
  annotationObjects: AnnotationType[];
  clips: Clip[];
}

type Color = number;
export interface AnnotationType {
  name: string;
  shapeType: 'Cube' | 'Line' | 'Polygon' | 'Point';
  color: Color;
}

export interface AnnotationInstance {
  type: AnnotationType;
}

// export interface

export interface Clip {
  id: string;
  frameSize: number;
  frames: Frame[];
}
