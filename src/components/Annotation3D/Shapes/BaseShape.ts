import type { Point2D } from '../Input';

export interface BaseShape {
  update: (params: any) => void;
}
