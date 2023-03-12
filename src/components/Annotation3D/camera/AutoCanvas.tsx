import { useEffect, useMemo, useRef, useState } from 'react';

export function AutoCanvas({
  width,
  url,
  showName,
}: {
  width: number;
  url: string;
  showName: string;
}): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const image = useMemo(() => {
    const imageTag = new Image();
    imageTag.src = url;
    imageTag.onload = (data) => {
      setNaturalSize({
        width: data.target?.naturalWidth ?? 100,
        height: data.target?.naturalHeight ?? 100,
      });
    };
    return imageTag;
  }, []);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: width,
    height: 100,
  });

  useEffect(() => {
    if (canvasRef.current) {
      const canvasHeight = (naturalSize.height / naturalSize.width) * width;
      canvasRef.current.width = width;
      canvasRef.current.height = canvasHeight;
      const context = canvasRef.current.getContext('2d');
      context?.drawImage(image, 0, 0, width, canvasHeight);
    }
  }, [naturalSize, width]);

  return <canvas ref={canvasRef}></canvas>;
}
