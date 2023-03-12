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

interface RowBaseAnnotation {
  id: string;
  tags?: Tag[];
}

export interface CubeRowAnnotation extends RowBaseAnnotation {
  shapeType: AnnotationType.Cube;
  position: Point3D;
  length: number;
  width: number;
  height: number;
  orientation: Quaternion;
}

export type RowAnnotation = CubeRowAnnotation;
// export interface

export interface Frame {
  id: string;
  index: number;
  pcd: string;
  frontImage: string;
  leftImage: string;

  annotations: RowAnnotation[];
}
export interface Clip {
  id: string;
  frameSize: number;
  frames: Frame[];
}
