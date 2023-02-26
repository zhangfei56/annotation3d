import {
  Box3,
  LineSegments,
  LineBasicMaterial,
  BufferAttribute,
  BufferGeometry,
  Material,
} from 'three';

export default class CubeLines extends LineSegments<BufferGeometry, Material> {
  constructor(box3: Box3, color = 0xffff00) {
    const indices = new Uint16Array([
      0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
    ]);
    const positions = new Float32Array(8 * 3);

    const geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    super(geometry, new LineBasicMaterial({ color: color, toneMapped: false }));

    this.type = 'BoxHelper';

    this.matrixAutoUpdate = false;

    this.update(box3);
  }

  public update(box: Box3): void {
    if (box.isEmpty()) return;

    const min = box.min;
    const max = box.max;

    /*
      z
      |
      | 5____4
      1/___0/|
      | 6__|_7
      2/___3/______>x
      
		0: max.x, min.y, max.z
		1: min.x, min.y, max.z
		2: min.x, min.y, min.z
		3: max.x, min.y, min.z
		4: max.x, max.y, max.z
		5: min.x, max.y, max.z
		6: min.x, max.y, min.z
		7: max.x, max.y, min.z
		*/

    const position = this.geometry.attributes.position;
    const array: number[] = position.array as number[];

    array[0] = max.x;
    array[1] = min.y;
    array[2] = max.z;
    array[3] = min.x;
    array[4] = min.y;
    array[5] = max.z;
    array[6] = min.x;
    array[7] = min.y;
    array[8] = min.z;
    array[9] = max.x;
    array[10] = min.y;
    array[11] = min.z;
    array[12] = max.x;
    array[13] = max.y;
    array[14] = max.z;
    array[15] = min.x;
    array[16] = max.y;
    array[17] = max.z;
    array[18] = min.x;
    array[19] = max.y;
    array[20] = min.z;
    array[21] = max.x;
    array[22] = max.y;
    array[23] = min.z;

    position.needsUpdate = true;

    this.geometry.computeBoundingSphere();
  }

  // copy(source, recursive) {
  //   super.copy(source, recursive);

  //   return this;
  // }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
