import { Object3D, Event, Points,DynamicDrawUsage, PointsMaterial } from "three";
import { BaseShape } from "./BaseShape";
import { DynamicBufferGeometry } from '../ThreeDee/DynamicBufferGeometry'


export function createGeometry(usage: THREE.Usage): DynamicBufferGeometry {
  const geometry = new DynamicBufferGeometry(usage);
  geometry.name = `PointScans:geometry`;
  geometry.createAttribute("position", Float32Array, 3);
  geometry.createAttribute("color", Uint8Array, 4, true);
  return geometry;
}
export function createPoints(
  geometry: DynamicBufferGeometry,
  material: THREE.Material,
): THREE.Points {
  const points = new Points(geometry, material);
  // We don't calculate the bounding sphere for points, so frustum culling is disabled
  points.frustumCulled = false;
  points.name = `PointCloud:points`;

  return points;
}


export class PointCloud extends BaseShape{

  points: Points
  geometry: DynamicBufferGeometry
  public constructor() {
    super()
    this.geometry = createGeometry(DynamicDrawUsage);

    const material = new PointsMaterial({
      vertexColors: true,
      size: 1,
      sizeAttenuation: false,
      // transparent,
      // The sorting issues caused by writing semi-transparent pixels to the depth buffer are less
      // distracting for point clouds than the self-sorting artifacts when depth writing is disabled
      depthWrite: true,
    });

    this.points = createPoints(
      this.geometry,
      material,
    );
  }

  public updatePoint(){
    
  }

  public getThreeObject(): Points {
    return this.points
  }
}
