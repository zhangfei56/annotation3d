import { Card, Empty, Radio, Switch } from 'antd';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';

import { useAnnotationConfig } from '../context/AnnotationConfigContext';

export function CameraSetting(): JSX.Element {
  const { config, setConfig } = useAnnotationConfig();
  const { cameraConfig } = config;
  const toggleCameraHidden = useCallback(
    (cameraName: string, hidden: boolean) => {
      const oldList = cameraConfig.cameraList;
      const existed = oldList.find((item) => item.name === cameraName);
      if (existed) {
        existed.isHidden = hidden;
      }
      setConfig({
        ...config,
        cameraConfig: {
          ...cameraConfig,
          cameraList: oldList,
        },
      });
    },
    [setConfig],
  );

  const ModeChoice = useMemo(() => {
    return (
      <div>
        <span>Camera Mode:</span>
        <Radio.Group
          onChange={(val) => {
            setConfig({
              ...config,
              cameraConfig: {
                ...config.cameraConfig,
                mode: val.target.value,
              },
            });
          }}
          value={cameraConfig.mode}
        >
          <Radio.Button value={'hidden'}>Hidden</Radio.Button>
          <Radio.Button value={'list'}>List</Radio.Button>
          <Radio.Button value={'one-fixed'}>Fixed</Radio.Button>
        </Radio.Group>
      </div>
    );
  }, [cameraConfig.mode]);

  const ModeFixedConfigComponent = useMemo(() => {
    const fixedCamera = cameraConfig.cameraList.find((item) => item.isFixed);

    const CameraFixedRadio = cameraConfig.cameraList.map((item) => (
      <Radio key={`fixed-radio${item.name}`} value={item.name}>
        {item.showName}
      </Radio>
    ));
    return (
      <Radio.Group
        onChange={(e) => {
          const checkedName = e.target.value;
          const cameraConfigList = _.clone(cameraConfig.cameraList);
          cameraConfigList.map((item) => (item.isFixed = false));
          const chosen = cameraConfigList.find((item) => item.name === checkedName);
          if (chosen) {
            chosen.isFixed = true;
          }
          setConfig({
            ...config,
            cameraConfig: {
              ...cameraConfig,
              cameraList: cameraConfigList,
            },
          });
        }}
        value={fixedCamera?.name}
      >
        {CameraFixedRadio}
      </Radio.Group>
    );
  }, [cameraConfig]);

  const ModeListConfigComponent = useMemo(
    () =>
      cameraConfig.cameraList.map((item, index) => {
        return (
          <Card title={item.name} key={`hidden-${index}`}>
            <span>Hidden</span>
            <Switch
              checked={item?.isHidden}
              onChange={(checked) => {
                toggleCameraHidden(item.name, checked);
              }}
            ></Switch>
          </Card>
        );
      }),
    [],
  );

  const ModeDetailComponent = useMemo(() => {
    if (cameraConfig.mode === 'hidden')
      return <Empty description={<span>Hidden All Camera</span>} />;
    else if (cameraConfig.mode === 'list') return ModeListConfigComponent;
    else return ModeFixedConfigComponent;
  }, [cameraConfig.mode, ModeFixedConfigComponent, ModeListConfigComponent]);

  return (
    <div>
      {ModeChoice} {ModeDetailComponent}
    </div>
  );
}
