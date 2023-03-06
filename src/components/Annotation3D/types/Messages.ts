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

interface LabelType {
  name: string;
  type: 'input' | 'radio' | 'checkbox';
  value: string | string[];
}

interface Label {
  type: LabelType;
  name: string;
  value: string;
}

interface BaseAnnotationAttribute {
  id: string;
  type: AnnotationType;
}

interface CubeAnnotation extends BaseAnnotationAttribute {
  position: Point3D;
  length: number;
  width: number;
  height: number;
  orientation: Quaternion;
}

export type AnnotationInstance = CubeAnnotation;
// export interface

export interface Frame {
  id: string;
  index: number;
  pcd: string;
  frontImage: string;
  leftImage: string;
}
export interface Clip {
  id: string;
  frameSize: number;
  frames: Frame[];

  annotations: AnnotationInstance[];
}
