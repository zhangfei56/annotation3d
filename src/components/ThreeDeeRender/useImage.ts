import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'

export type ImageExport = {
  area: {width: number, height: number};
  imagePlane: THREE.Mesh;
}
export function useImage(imageUrl: string){
  const [imageInfo, setImageInfo] = useState< ImageExport| undefined>();


  useEffect(()=> {
    loadImage(imageUrl)
  }, [imageUrl])

  const loadImage = useCallback((url: string)=> {
    const loader = new THREE.ImageBitmapLoader();
    loader.setOptions({ imageOrientation: 'flipY' });
  
    loader.load(
      url,
      // onLoad回调
      function (imageBitmap) {
        const texture = new THREE.CanvasTexture(imageBitmap);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
  
        const faceGeometry = new THREE.PlaneGeometry(imageBitmap.width, imageBitmap.height);
        const mesh = new THREE.Mesh(faceGeometry, material)
        setImageInfo({
          area: {
            width: imageBitmap.width,
            height: imageBitmap.height
          },
          imagePlane: mesh
        })
      },
  
      // 目前暂不支持onProgress的回调
      undefined,
  
      // onError回调
      function (err) {
        console.log('An error happened');
      }
    );
  }, [])

  return imageInfo
}

