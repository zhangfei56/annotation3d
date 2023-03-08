import {
  CaretRightOutlined,
  FastBackwardOutlined,
  FastForwardOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from '@ant-design/icons';
import { Button, Row, Slider, Space } from 'antd';
import log from 'log';

import { useCurrentClip } from './context/ClipContext';

export function Control() {
  const { nextFrame } = useCurrentClip();
  return (
    <Row>
      <Space>
        <Slider style={{ width: '100px' }}></Slider>

        <Button type="primary" icon={<FastBackwardOutlined />} size="small" />
        <Button type="primary" icon={<StepBackwardOutlined />} size="small" />
        <Button type="primary" icon={<CaretRightOutlined />} size="small" />
        <Button
          type="primary"
          onClick={() => {
            log.debug('control click next');
            nextFrame();
          }}
          icon={<StepForwardOutlined />}
          size="small"
        />
        <Button type="primary" icon={<FastForwardOutlined />} size="small" />
      </Space>
    </Row>
  );
}
