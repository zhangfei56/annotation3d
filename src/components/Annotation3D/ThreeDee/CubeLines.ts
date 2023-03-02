import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
  Material,
} from 'three';

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

export default class CubeLines extends LineSegments<BufferGeometry, Material> {
  constructor(color = 0xffff00) {
    const indices = new Uint16Array([
      0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
    ]);
    const max = {
      x: 0.5,
      y: 0.5,
      z: 0.5,
    };
    const min = {
      x: -0.5,
      y: -0.5,
      z: -0.5,
    };
    const positions = new Float32Array(8 * 3);
    positions[0] = max.x;
    positions[1] = min.y;
    positions[2] = max.z;
    positions[3] = min.x;
    positions[4] = min.y;
    positions[5] = max.z;
    positions[6] = min.x;
    positions[7] = min.y;
    positions[8] = min.z;
    positions[9] = max.x;
    positions[10] = min.y;
    positions[11] = min.z;
    positions[12] = max.x;
    positions[13] = max.y;
    positions[14] = max.z;
    positions[15] = min.x;
    positions[16] = max.y;
    positions[17] = max.z;
    positions[18] = min.x;
    positions[19] = max.y;
    positions[20] = min.z;
    positions[21] = max.x;
    positions[22] = max.y;
    positions[23] = min.z;

    const geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    super(geometry, new LineBasicMaterial({ color: color, toneMapped: false }));

    this.type = 'BoxHelper';

    this.matrixAutoUpdate = false;
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
