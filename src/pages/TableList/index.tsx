import { PlusOutlined } from '@ant-design/icons';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, Input } from 'antd';
import React, { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';

import UpdateForm from './components/UpdateForm';
import { rule, useRuleMutation } from './services';
import type { PageParams, RuleListItem } from './types';

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<RuleListItem[]>([]);

  const { updateRule, addRule, removeRule } = useRuleMutation();

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const columns: ProColumns<RuleListItem>[] = [
    {
      title: 'Rule name',
      dataIndex: 'name',
      tip: 'The rule name is the unique key',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      valueType: 'textarea',
    },
  ];

  return (
    <PageContainer>
      <ProTable<RuleListItem, PageParams>
        headerTitle="Enquiry form"
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> New
          </Button>,
        ]}
        request={rule}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Chosen <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a> 项
              &nbsp;&nbsp;
              <span>
                Total number of service calls
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)} 万
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await removeRule(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            Batch deletion
          </Button>
          <Button type="primary">Batch approval</Button>
        </FooterToolbar>
      )}
      <ModalForm
        title="New rule"
        width="400px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await addRule(value as RuleListItem);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) actionRef.current.reload();
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: 'Rule name is required',
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          const success = await updateRule(value);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) actionRef.current.reload();
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          if (!showDetail) setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<RuleListItem>[]}
          />
        )}
      </Drawer>
      <Outlet />
    </PageContainer>
  );
};

export default TableList;
