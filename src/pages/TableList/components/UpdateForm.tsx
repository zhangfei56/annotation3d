import {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-form';
import { Modal } from 'antd';
import React from 'react';

import type { FormValueType, RuleListItem } from '../types';

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<RuleListItem>;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  return (
    <StepsForm
      stepsProps={{
        size: 'small',
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            width={640}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title="规则配置"
            visible={props.updateModalVisible}
            footer={submitter}
            onCancel={() => {
              props.onCancel();
            }}
          >
            {dom}
          </Modal>
        );
      }}
      onFinish={props.onSubmit}
    >
      <StepsForm.StepForm
        initialValues={{
          name: props.values.name,
          desc: props.values.desc,
        }}
        title="基本信息"
      >
        <ProFormText
          name="name"
          label="规则名称"
          width="md"
          rules={[
            {
              required: true,
              message: '请输入规则名称！',
            },
          ]}
        />
        <ProFormTextArea
          name="desc"
          width="md"
          label="规则描述"
          placeholder="请输入至少五个字符"
          rules={[
            {
              required: true,
              message: '请输入至少五个字符的规则描述！',
              min: 5,
            },
          ]}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default UpdateForm;
