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
  Dropdown,
  Menu,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  LinkOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PictureOutlined,
  CloudOutlined,
  EllipsisOutlined,
  ArrowsAltOutlined,
  FullscreenOutlined,  
} from "@ant-design/icons";

const { Title } = Typography;

const Category = ({ data = [] }) => {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState(data);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("viewMode") || "list"
  );
  const [iconSize, setIconSize] = useState(
    parseInt(localStorage.getItem("iconSize")) || 24
  );
  const [showUrl, setShowUrl] = useState(false);
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditingBookmark(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
        logoUrl: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          values.url
        )}&size=32`,
      };

      if (editingBookmark) {
        await updateDoc(
          doc(db, "users", user.uid, "bookmarks", editingBookmark.id),
          bookmarkData
        );
        message.success("Bookmark updated successfully!");
      } else {
        await addDoc(
          collection(db, "users", user.uid, "bookmarks"),
          bookmarkData
        );
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

  const handleViewChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("viewMode", mode);
  };

  const handleShowUrlClick = () => {
    const newShowUrl = !showUrl;
    setShowUrl(newShowUrl);
    if (newShowUrl) {
      setViewMode("list");
      localStorage.setItem("viewMode", "list");
    }
  };

  const handleIconSizeChange = (size) => {
    setIconSize(size);
    localStorage.setItem("iconSize", size);
  };

  const showEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    form.setFieldsValue({
      title: bookmark.name,
      url: bookmark.link,
    });
    setIsModalVisible(true);
  };

  const { SubMenu } = Menu;
  

 const viewMenu = (
   <Menu className="dark:bg-gray-900 w-40">
     <SubMenu key="view" title="Display">
       <Menu.Item
         key="list"
         icon={<UnorderedListOutlined />}
         onClick={() => handleViewChange("list")}
       >
         List View
       </Menu.Item>
       <Menu.Item
         key="grid"
         icon={<AppstoreOutlined />}
         onClick={() => handleViewChange("grid")}
       >
         Grid View
       </Menu.Item>
       <Menu.Item
         key="icon"
         icon={<PictureOutlined />}
         onClick={() => handleViewChange("icon")}
       >
         Icon-Only View
       </Menu.Item>
       <Menu.Item
         key="cloud"
         icon={<CloudOutlined />}
         onClick={() => handleViewChange("cloud")}
       >
         Cloud View
       </Menu.Item>
     </SubMenu>
     <Menu.Divider />
     <SubMenu key="details" title="Details">
       <Menu.Item key="toggle-url" type="text" onClick={handleShowUrlClick}>
         <div className="flex items-center justify-between w-full gap-2 -mb-2">
           <img src="/link.png" alt="" className="h-10 " />
           <span className="-mt-1.5 ">{showUrl ? "Hide URL" : "Show URL"}</span>
         </div>
       </Menu.Item>
     </SubMenu>
     <Menu.Divider />
     <SubMenu key="space-options" title="Size">
       <Menu.Item
         key="icon-sizes-small"
         onClick={() => handleIconSizeChange(20)}
         icon={<FullscreenOutlined />}
       >
         Small
       </Menu.Item>
       <Menu.Item
         key="icon-sizes-medium"
         onClick={() => handleIconSizeChange(28)}
         icon={<FullscreenOutlined />}
       >
         Medium
       </Menu.Item>
       <Menu.Item
         key="icon-sizes-large"
         onClick={() => handleIconSizeChange(38)}
         icon={<FullscreenOutlined />}
       >
         Large
       </Menu.Item>
     </SubMenu>
   </Menu>
 );

  const renderBookmarks = () => {
    if (viewMode === "list") {
      return (
        <List
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
              <List.Item.Meta
                avatar={
                  <img
                    src={bookmark.logoUrl}
                    alt="Logo"
                    style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
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
                  >
                    {bookmark.name}
                  </a>
                }
                description={showUrl ? bookmark.link : ""}
              />
            </List.Item>
          )}
        />
      );
    } else if (viewMode === "grid") {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "15px",
            padding: "15px",
          }}
        >
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                borderRadius: "5px",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                cursor: "pointer",
                padding: "5px",
                textAlign: "center",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0, 0, 0, 0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 0, 0, 0.1)";
              }}
            >
              <img
                src={bookmark.logoUrl}
                alt={bookmark.name}
                style={{
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  marginBottom: "1px",
                  objectFit: "contain",
                  margin: "auto",
                }}
                onError={(e) => {
                  e.target.src = "https://www.google.com/favicon.ico";
                }}
              />
              <p style={{ margin: "0" }}>{bookmark.name}</p>
            </div>
          ))}
        </div>
      );
    } else if (viewMode === "icon") {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                width: "auto",
                padding: "10px",
                borderRadius: "5px",
                textAlign: "center",
                cursor: "pointer",
                margin: "5px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={bookmark.logoUrl}
                alt={bookmark.name}
                style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                onError={(e) => {
                  e.target.src = "https://www.google.com/favicon.ico";
                }}
              />
            </div>
          ))}
        </div>
      );
    } else if (viewMode === "cloud") {
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            justifyContent: "center",
            alignItems: "center",  
          }}
        >
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                width: "auto",
                maxWidth: "150px",
                padding: "1px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                transition: "transform 0.3s ease-in-out",
                cursor: "pointer",
                margin: "1px",

                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={bookmark.logoUrl}
                alt={bookmark.name}
                style={{ width: iconSize, height: iconSize }}
                onError={(e) => {
                  e.target.src = "https://www.google.com/favicon.ico";
                }}
              />
              <p style={{ marginTop: "-1px", marginLeft: "2px" }}>
                {bookmark.name}
              </p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="dark:text-white bg-white dark:bg-gray-900">
      <Card
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="dark:text-white m-0">
              My Bookmarks
            </Title>
            <div>
              <Dropdown overlay={viewMenu} trigger={["click"]}>
                <Button>
                  <EllipsisOutlined className="rotate-90" />
                </Button>
              </Dropdown>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              ></Button>
            </div>
          </div>
        }
        className="dark:bg-gray-900 border-none"
      >
        {renderBookmarks()}
      </Card>

      <Modal
        title={editingBookmark ? "Edit Bookmark" : "Add New Bookmark"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBookmark}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter bookmark title" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "Please enter a URL" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item className="text-right">
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
