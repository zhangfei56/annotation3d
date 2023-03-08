import { DynamicDrawUsage, Event, Object3D, Points, PointsMaterial } from 'three';

import { getColorConverter } from '../ThreeDee/colors';
import { DynamicBufferGeometry } from '../ThreeDee/DynamicBufferGeometry';
import { FieldReader } from '../ThreeDee/fieldReaders';
import { BaseShape } from './BaseShape';

export function createGeometry(usage: THREE.Usage): DynamicBufferGeometry {
  const geometry = new DynamicBufferGeometry(usage);
  geometry.name = `PointScans:geometry`;
  geometry.createAttribute('position', Float32Array, 3);
  geometry.createAttribute('color', Uint8Array, 4, true);
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

const colorConverter = getColorConverter(
  // {
  //   colorMode: 'colormap',
  //   colorMap: 'turbo',
  //   flatColor: '',
  //   gradient: ['', ''],
  //   explicitAlpha: 0,
  // },
  {
    colorMode: 'gradient',
    colorMap: 'turbo',
    flatColor: '',
    gradient: ['#40ffff', '#81b929eb'],
    explicitAlpha: 0,
  },
  0,
  40,
);
const tempColor = { r: 0, g: 0, b: 0, a: 0 };

export class PointCloud extends Object3D implements BaseShape {
  points: Points;
  geometry: DynamicBufferGeometry;

  xReader?: FieldReader;
  yReader?: FieldReader;
  zReader?: FieldReader;
  colorReader?: FieldReader;
  public constructor() {
    super();
    this.type = 'PointCloud';
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

    this.points = createPoints(this.geometry, material);
    this.add(this.points);
  }

  public update({
    pointCount,
    pointStep,
    content,
  }: {
    pointCount: number;
    pointStep: number;
    content: ArrayBufferView;
  }) {
    this.geometry.resize(pointCount);

    const positionAttribute = this.geometry.attributes.position!;

    const colorAttribute = this.geometry.attributes.color;

    const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
    for (let i = 0; i < pointCount; i++) {
      const pointOffset = i * pointStep;
      const x = this.xReader?.(view, pointOffset) ?? 0;
      const y = this.yReader?.(view, pointOffset) ?? 0;
      const z = this.zReader?.(view, pointOffset) ?? 0;
      positionAttribute.setXYZ(i, x, y, z);

      const colorValue = this.colorReader?.(view, pointOffset) ?? 0;
      colorConverter(tempColor, colorValue);
      colorAttribute.setXYZW(i, tempColor.r, tempColor.g, tempColor.b, tempColor.a);
    }
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  public setReader({
    xReader,
    yReader,
    zReader,
    colorReader,
  }: {
    xReader?: FieldReader;
    yReader?: FieldReader;
    zReader?: FieldReader;
    colorReader?: FieldReader;
  }) {
    this.xReader = xReader;
    this.yReader = yReader;
    this.zReader = zReader;
    this.colorReader = colorReader;
  }
}
