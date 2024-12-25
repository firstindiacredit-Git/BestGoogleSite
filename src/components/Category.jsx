import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
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
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  LinkOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

function Category() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
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
        setBookmarks(bookmarksData);
      });
      return () => unsubscribe();
    }
  }, [user]);

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
        logoUrl: `https://logo.clearbit.com/${new URL(values.url).hostname}`,
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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Title level={4}>Please sign in to view your bookmarks</Title>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="m-0">
              My Bookmarks
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
            </Button>
          </div>
        }
        className="shadow-md"
      >
        <List
          loading={loading}
          dataSource={bookmarks}
          renderItem={(bookmark) => (
            <List.Item
              key={bookmark.id}
              actions={[
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(bookmark)}
                  />
                </Tooltip>,
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                  />
                </Tooltip>,
                <Tooltip title="Open in new tab">
                  <Button
                    type="text"
                    icon={<GlobalOutlined />}
                    onClick={() => window.open(bookmark.link, "_blank")}
                  />
                </Tooltip>,
              ]}
            >
              {console.log(bookmark.logoUrl)}
              <List.Item.Meta
                avatar={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bookmark.logoUrl}
                    alt=""
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
                description={bookmark.link}
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
}

export default Category;