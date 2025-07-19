import React, { useState } from 'react';
import { Table, Button, Upload, Modal, Space, Card, Form, Input, InputNumber, DatePicker, Select, message, Popconfirm, Spin, Skeleton } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

const LoadingTable = () => (
  <div style={{ padding: '24px' }}>
    <div style={{ marginBottom: '16px' }}>
      <Skeleton.Button active style={{ width: 120, height: 32 }} />
    </div>
    <Skeleton active paragraph={{ rows: 5 }} />
  </div>
);

const DataEntryGrid = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    'Income',
    'Expense',
    'Investment',
    'Savings',
    'Other'
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      editable: true,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      editable: true,
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      editable: true,
      render: (text) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      editable: true,
    },
    {
      title: 'Image',
      key: 'image',
      width: 100,
      render: (_, record) => (
        record.image ? (
          <img
            src={record.image}
            alt="Record"
            style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => handlePreview(record.image)}
            onMouseEnter={() => handlePreview(record.image)}
            onMouseLeave={() => setPreviewOpen(false)}
          />
        ) : null
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const isEditing = record.key === editingKey;
        return isEditing ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => save(record.key)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => cancel()}
            />
          </Space>
        ) : (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
            />
            <Popconfirm
              title="Are you sure you want to delete this record?"
              onConfirm={() => handleDelete(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={editingKey !== ''}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handleAddRow = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      setIsSubmitting(true);
      try {
        const newRow = {
          key: dataSource.length + 1,
          id: dataSource.length + 1,
          ...values,
          date: values.date.format('YYYY-MM-DD'),
        };
        setDataSource([...dataSource, newRow]);
        setIsModalVisible(false);
        form.resetFields();
        message.success('Record added successfully');
      } catch (error) {
        message.error('Failed to add record');
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (key) => {
    setIsDeleting(true);
    try {
      setDataSource(dataSource.filter(item => item.key !== key));
      message.success('Record deleted successfully');
    } catch (error) {
      message.error('Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const edit = (record) => {
    form.setFieldsValue({
      description: record.description,
      amount: record.amount,
      date: dayjs(record.date),
      category: record.category,
    });
    setEditingKey(record.key);
  };

  const save = async (key) => {
    try {
      setIsSubmitting(true);
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
          date: row.date.format('YYYY-MM-DD'),
        });
        setDataSource(newData);
        setEditingKey('');
        message.success('Record updated successfully');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
      message.error('Failed to update record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage = reader.result;
          setSelectedImage(newImage);
          if (editingKey) {
            const updatedDataSource = dataSource.map(item => {
              if (item.key === editingKey) {
                return { ...item, image: newImage };
              }
              return item;
            });
            setDataSource(updatedDataSource);
          }
        };
        reader.readAsDataURL(info.file.originFileObj);
      }
    },
  };

  return (
    <Card>
      <Spin 
        spinning={isLoading} 
        tip="Loading data..."
        indicator={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '8px'
          }}>
            <Spin size="large" />
            <span style={{ color: '#1890ff' }}>Loading your data...</span>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRow}
            loading={isSubmitting}
          >
            Add Record
          </Button>
        </div>

        {isLoading ? (
          <LoadingTable />
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            rowKey="key"
            loading={isLoading}
          />
        )}

        <Modal
          title={
            <Space>
              Add New Record
              {isSubmitting && <Spin size="small" />}
            </Space>
          }
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          confirmLoading={isSubmitting}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select>
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          open={previewOpen}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Spin>
    </Card>
  );
};

export default DataEntryGrid; 