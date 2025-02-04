import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Button,
  Tag,
  Space,
  Typography,
  Modal,
  Drawer,
  Tooltip,
  Empty,
  Spin,
  message,
  Avatar,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  StarFilled,
  ClockCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import AddBlog from "./AddBlog";

const { Title, Text, Paragraph } = Typography;

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const blogsQuery = query(
        collection(db, "blogs"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(blogsQuery);
      const blogsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString(),
      }));
      setBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      message.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "blogs", selectedBlog.id));
      message.success("Blog deleted successfully");
      fetchBlogs();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error("Error deleting blog:", error);
      message.error("Failed to delete blog");
    }
  };

  const renderBlogList = () => {
    const featuredBlogs = blogs.filter((blog) => blog.featured);
    const regularBlogs = blogs.filter((blog) => !blog.featured);

    return (
      <div className="space-y-8">
        {featuredBlogs.length > 0 && (
          <div>
            <Title level={4} className="mb-4">
              Featured Articles
            </Title>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
              dataSource={featuredBlogs}
              renderItem={renderBlogCard}
            />
          </div>
        )}

        <div>
          <Title level={4} className="mb-4">
            Latest Articles
          </Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
            dataSource={regularBlogs}
            renderItem={renderBlogCard}
          />
        </div>
      </div>
    );
  };

  const renderBlogCard = (blog) => (
    <List.Item>
      <Card
        hoverable
        className="transition-all duration-300 hover:shadow-xl bg-white rounded-lg overflow-hidden"
        cover={
          <div className="relative h-56 overflow-hidden group">
            <img
              alt={blog.title}
              src={blog.imageUrl}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              {blog.featured && (
                <Tag color="gold" className="flex items-center shadow-lg">
                  <StarFilled className="mr-1" /> Featured
                </Tag>
              )}
              <Tag color="blue" className="shadow-lg">
                {blog.category}
              </Tag>
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => (
                  <Tag
                    key={tag}
                    className="bg-white/90 backdrop-blur-sm shadow-lg"
                    icon={<TagOutlined />}
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        }
        actions={[
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                // Add preview functionality
              }}
            />
          </Tooltip>,
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedBlog(blog);
                setShowAddForm(true);
              }}
            />
          </Tooltip>,
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedBlog(blog);
                setDeleteModalVisible(true);
              }}
            />
          </Tooltip>,
        ]}
      >
        <div className="px-1">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${blog.author}&background=6366f1&color=fff`}
              className="border-2 border-indigo-100"
            />
            <div>
              <div className="text-sm font-medium text-gray-800">
                {blog.author}
              </div>
              <div className="text-xs text-gray-500">{blog.createdAt}</div>
            </div>
          </div>

          <Title
            level={5}
            className="mb-2 text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors"
          >
            {blog.title}
          </Title>

          <Paragraph ellipsis={{ rows: 2 }} className="text-gray-600 mb-4">
            {blog.summary}
          </Paragraph>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <ClockCircleOutlined />
              <span>{blog.readTime || "5 minutes read"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileTextOutlined />
              <span>{Math.ceil(blog.content?.length / 1000)} min read</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserOutlined />
              <span>{blog.views || 0} views</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Tag
                  color={blog.status === "published" ? "success" : "warning"}
                >
                  {blog.status || "Draft"}
                </Tag>
              </div>
              <div>
                Last updated:{" "}
                {new Date(
                  blog.updatedAt || blog.createdAt
                ).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="!mb-2">
              Blog Management
            </Title>
            <Text type="secondary">Manage and organize your blog posts</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            size="large"
            onClick={() => {
              setSelectedBlog(null);
              setShowAddForm(true);
            }}
            className="flex items-center"
          >
            Add New Post
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Spin size="large" />
            <div className="mt-4 text-gray-500">Loading blog posts...</div>
          </div>
        ) : blogs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-gray-500">
                <p className="mb-2">No blog posts yet</p>
                <p className="text-sm">Start creating your first blog post!</p>
              </div>
            }
          />
        ) : (
          renderBlogList()
        )}
      </div>

      <Drawer
        title={selectedBlog ? "Edit Blog Post" : "Add New Blog Post"}
        placement="right"
        width="100%"
        onClose={() => {
          setShowAddForm(false);
          setSelectedBlog(null);
        }}
        open={showAddForm}
        bodyStyle={{ padding: 0 }}
      >
        <AddBlog
          editBlog={selectedBlog}
          onSuccess={() => {
            setShowAddForm(false);
            setSelectedBlog(null);
            fetchBlogs();
          }}
        />
      </Drawer>

      <Modal
        title="Delete Blog"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this blog post? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default BlogList;
