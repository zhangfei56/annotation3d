
import { parsePCD } from '../../utils/pcdParser'
import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'

import pcdUrl from '../../assets/frm.pcd'
import imageUrl from '../../assets/11.png'
import axios from 'axios'
import { getReader } from './ThreeDee/fieldReaders'
import { DynamicBufferGeometry } from './ThreeDee/DynamicBufferGeometry'
import { getColorConverter } from './ThreeDee/colors'
import Renderer from './Renderer'


export type PointField = Readonly<{
  name: string;
  offset: number;
  datatype: number;
  count: number;
  mask?: DataView;
}>;


export enum DATATYPE {
  INT8 = 1,
  UINT8 = 2,
  INT16 = 3,
  UINT16 = 4,
  INT32 = 5,
  UINT32 = 6,
  FLOAT32 = 7,
  FLOAT64 = 8,
}

function toDatatype(type: string, size: number) {
  switch (`${type}${size}`) {
    case "U1":
      return DATATYPE.UINT8;
    case "U2":
      return DATATYPE.UINT16;
    case "U4":
      return DATATYPE.UINT32;
    case "U8":
      return DATATYPE.UINT32;
    case "I1":
      return DATATYPE.INT8;
    case "I2":
      return DATATYPE.INT16;
    case "I4":
      return DATATYPE.INT32;
    case "F4":
      return DATATYPE.FLOAT32;
    case "F8":
      return DATATYPE.FLOAT64;
    default:
      throw new Error(`Unknow Datatype in type='${type}' and size=${size}`);
  }
}
const tempColor = { r: 0, g: 0, b: 0, a: 0 };

export async function loadPcd(renderder: Renderer) {
  const res = await axios.get(pcdUrl, {responseType: 'arraybuffer'})
  const buf = res.data
  

  const { header, content } = parsePCD(buf);

  const fieldObjs: PointField[] = header.fieldNames.map((name) => {
    const field = header.fields[name];
    if (field == undefined) {
      throw new Error("Bad Header Name: " + name);
    }
    return {
      name,
      offset: field.offset,
      count: field.count,
      datatype: toDatatype(field.type, field.size),
    };
  });

  const stride = header.rowSize
  // get reader
  let xReader 
  let yReader
  let zReader
  let colorReader
  for(let i = 0; i < fieldObjs.length; i++) {
    const fieldObj= fieldObjs[i]
    if(fieldObj.name ==='x'){
      xReader = getReader(fieldObj, stride )
    } else if(fieldObj.name ==='y'){
      yReader  = getReader(fieldObj, stride )
    } else if(fieldObj.name ==='z'){
      zReader = getReader(fieldObj, stride)
    } else if(fieldObj.name ==='intensity'){
      colorReader = getReader(fieldObj, stride)
    }
  }
  const geometry = createGeometry(THREE.DynamicDrawUsage);

  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1,
    sizeAttenuation: false,
    // transparent,
    // The sorting issues caused by writing semi-transparent pixels to the depth buffer are less
    // distracting for point clouds than the self-sorting artifacts when depth writing is disabled
    depthWrite: true,
  });

  const points = createPoints(
    geometry,
    material,
  );

  const pointCount = header.points
  const pointStep = stride

  geometry.resize(pointCount)
  const positionAttribute = geometry.attributes.position!;

  const colorAttribute = geometry.attributes.color

  const colorConverter = getColorConverter(
    {
      colorMode: 'colormap',
      colorMap: 'rainbow',
      flatColor: '',
      gradient: ['', ''],
      explicitAlpha: 0
    },
    0,
    80,
  );
  
  const view = new DataView(content.buffer, content.byteOffset, content.byteLength);
  for (let i = 0; i < pointCount; i++) {
    const pointOffset = i * pointStep;
    const x = xReader?.(view, pointOffset) ?? 0;
    const y = yReader?.(view, pointOffset) ?? 0;
    const z = zReader?.(view, pointOffset)?? 0;
    positionAttribute.setXYZ(i, x, y, z);

    const colorValue = colorReader?.(view, pointOffset) ?? 0;
    colorConverter(tempColor, colorValue);
    colorAttribute.setXYZW(i, tempColor.r, tempColor.g, tempColor.b, tempColor.a);
  }
  positionAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
  geometry.computeBoundingSphere();

  renderder.add(points)

  renderder.render()
  
  // 

  return fieldObjs
}

function getReaders(fieldObjs: PointField[]){

}


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
  const points = new THREE.Points(geometry, material);
  // We don't calculate the bounding sphere for points, so frustum culling is disabled
  points.frustumCulled = false;
  points.name = `PointCloud:points`;

  return points;
}
