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

export enum AnnotationType {
  Cube = 'Cube',
  Line = 'Line',
  Polygon = 'Polygon',
  Point = 'Point',
}

export interface Project {
  name: string;
  description: string;
  annotationObjects: AnnotationClass[];
  clips: Clip[];
}

type Color = number;
export interface AnnotationClass {
  name: string;
  shapeType: AnnotationType;
  color: Color;
}

interface TagTemplate {
  id: string;
  name: string;
  type: 'input' | 'radio' | 'checkbox';
  value: string | string[];
}

interface Tag {
  type: TagTemplate;
  name: string;
  value: string;
}

interface BaseAnnotationAttribute {
  id: string;
  shapeType: keyof typeof AnnotationType;
  tags?: Tag[];
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

  annotations: AnnotationInstance[];
}
export interface Clip {
  id: string;
  frameSize: number;
  frames: Frame[];

  annotations: AnnotationInstance[];
}
