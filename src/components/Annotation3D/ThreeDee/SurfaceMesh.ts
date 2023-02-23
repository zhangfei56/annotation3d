import { Material, Mesh, BoxGeometry, DoubleSide, MeshBasicMaterial } from 'three';

export default class SurfaceMesh extends Mesh<BoxGeometry, Material> {
  constructor(color = 0xffff00) {
    const geometry = new BoxGeometry();

    super(
      geometry,
      new MeshBasicMaterial({
        color: color,
        side: DoubleSide,
        vertexColors: false,
        depthTest: false,
        transparent: true,
        opacity: 0.3,
      }),
    );

    this.type = 'SurfaceMesh';
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
