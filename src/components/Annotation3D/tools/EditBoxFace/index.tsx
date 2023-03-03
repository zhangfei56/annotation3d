import EventEmitter from 'eventemitter3';
import { useEffect, useState } from 'react';

import SceneManager from '../../SceneManager';
import { ObjectBusEvent } from '../../types/Messages';
import { BoxFaceEnum, EditBoxFace } from './EditBoxFace';

const editToolBound = {
  height: 100,
  width: 100,
};

type Props = {
  eventBus: EventEmitter<ObjectBusEvent>;
  boxFace: BoxFaceEnum;
  sceneManager: SceneManager;
};

export default function BoxFaceContainer({ eventBus, boxFace, sceneManager }: Props) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (canvas) {
      new EditBoxFace(canvas, eventBus, 1, boxFace, sceneManager);
    }
  }, [canvas]);

  return (
    <div>
      <span>{BoxFaceEnum[boxFace]}</span>
      <canvas
        ref={setCanvas}
        width={editToolBound.width}
        height={editToolBound.height}
      ></canvas>
    </div>
  );
}
