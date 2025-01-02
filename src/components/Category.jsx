import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Typography,
  Tooltip,
  Empty,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  LinkOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import styles from '../styles/Category.module.css';

const { Title } = Typography;

const Category = ({ data = [] }) => {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState(data);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [form] = Form.useForm();

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch bookmarks for the current user
  useEffect(() => {
    if (user) {
      const bookmarksRef = collection(db, "users", user.uid, "bookmarks");
      const unsubscribe = onSnapshot(bookmarksRef, (snapshot) => {
        const bookmarksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // console.log(bookmarksData)
        setBookmarks(bookmarksData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarks");
    const savedContainerColor = localStorage.getItem("bookmarkContainerColor");

    if (data.length > 0) {
      setBookmarks(data);
    } else if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    if (savedContainerColor) {
      // setContainerColor(savedContainerColor); // This line was removed because setContainerColor is not defined
    }
  }, [data]);

  const handleAddBookmark = async (values) => {
    try {
      if (!user) {
        message.error("Please sign in to add bookmarks");
        return;
      }

      const bookmarkData = {
        name: values.title,
        link: values.url,
        createdAt: new Date().toISOString(),
        logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(values.url).hostname}`,
      };

      if (editingBookmark) {
        await updateDoc(
          doc(db, "users", user.uid, "bookmarks", editingBookmark.id),
          bookmarkData
        );
        message.success("Bookmark updated successfully!");
      } else {
        await addDoc(collection(db, "users", user.uid, "bookmarks"), bookmarkData);
        message.success("Bookmark added successfully!");
      }

      handleCancel();
    } catch (error) {
      message.error("Error: " + error.message);
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "bookmarks", bookmarkId));
      message.success("Bookmark deleted successfully!");
    } catch (error) {
      message.error("Error: " + error.message);
    }
  };

  const showEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    form.setFieldsValue({
      title: bookmark.name,
      url: bookmark.link,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBookmark(null);
    form.resetFields();
  };

  return (
    <div
    style={{borderRadius:"0px 0px 7px 7px"}}
    className= "max-w-sm dark:text-white bg-white dark:bg-gray-900">
      <Card
        title={
          <div className="flex dark:bg-gray-900 justify-between items-center">
            <Title level={4} className="dark:text-white m-0">
              My Bookmarks
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
            >
            </Button>
          </div>
        }
        style={{borderRadius:"0px 0px 7px 7px"}}
        className="dark:bg-gray-900 border-none"
      >
        <List
          loading={loading}
          dataSource={bookmarks}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center justify-center py-12">
                <button
                  onClick={() => setIsModalVisible(true)}
                  className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <PlusOutlined className="text-2xl text-gray-600 dark:text-gray-400" />
                </button>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Add your first bookmark</p>
              </div>
            )
          }}
          renderItem={(bookmark) => (
            <List.Item
              key={bookmark.id}
              className="dark:bg-gray-900"
              actions={[
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    icon={<EditOutlined className="dark:text-gray-600 hover:dark:text-gray-400" />}
                    onClick={() => showEditModal(bookmark)}
                  />
                </Tooltip>,
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined className="dark:text-gray-600 hover:dark:text-gray-400" />}
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                  />
                </Tooltip>,
                <Tooltip title="Open in new tab">
                  <Button
                    type="text"
                    icon={<GlobalOutlined className="dark:text-gray-600 hover:dark:text-gray-400" />}
                    onClick={() => window.open(bookmark.link, "_blank")}
                  />
                </Tooltip>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <img
                    src={bookmark.logoUrl}
                    alt="Links"
                    className="w-4 h-4"
                    onError={(e) => {
                      e.target.src = "https://www.google.com/favicon.ico";
                    }}
                  />
                }
                title={
                  <a
                    href={bookmark.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {bookmark.name}
                  </a>
                }
                description={<span className="dark:text-gray-600">{bookmark.link}</span>}
              />
            </List.Item>
          )}
        />
        
      </Card>

      <Modal
        title={editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBookmark}
          initialValues={editingBookmark}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input prefix={<EditOutlined />} placeholder="Enter bookmark title" />
          </Form.Item>

          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "Please enter a URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input prefix={<LinkOutlined />} placeholder="https://example.com" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingBookmark ? "Update" : "Add"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
    
  );
  
};

export default Category;
