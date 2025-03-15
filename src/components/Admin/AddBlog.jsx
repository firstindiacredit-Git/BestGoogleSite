import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Upload,
  Select,
  Tag,
  Space,
  Modal,
  Spin,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Option } = Select;

const categories = [
  "Business Finance",
  "Expense Management",
  "Bookkeeping",
  "Tax Tips",
  "Business Growth",
  "Financial Planning",
];

const AddBlog = ({ editBlog, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (editBlog) {
      form.setFieldsValue({
        title: editBlog.title,
        category: editBlog.category,
        summary: editBlog.summary,
        featured: editBlog.featured,
      });
      setContent(editBlog.content || "");
      setImageUrl(editBlog.imageUrl || "");
      setTags(editBlog.tags || []);
    }
  }, [editBlog, form]);

  const handleImageUpload = async (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
        throw new Error("Cloudinary configuration is missing");
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      const data = await response.json();

      if (!data.secure_url) {
        throw new Error("No image URL received from Cloudinary");
      }

      setImageUrl(data.secure_url);
      message.success("Image uploaded successfully!");
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error("Image upload error:", error);
      message.error(
        error.message || "Failed to upload image. Please try again."
      );
      setImageUrl("");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (!content) {
        message.error("Please add some content to your blog post");
        return;
      }

      if (!imageUrl) {
        message.error("Please upload a featured image");
        return;
      }

      const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const readTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

      const blogPost = {
        title: values.title,
        content,
        summary: values.summary,
        imageUrl,
        category: values.category,
        tags,
        featured: values.featured || false,
        readTime,
        author: "Admin", // You can get this from auth context if needed
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "blogs"), blogPost);
      message.success("Blog post created successfully!");
      form.resetFields();
      setContent("");
      setImageUrl("");
      setTags([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating blog post:", error);
      message.error("Failed to create blog post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClose = (removedTag) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const showPreview = () => {
    const values = form.getFieldsValue();
    const previewData = {
      title: values.title || "Untitled",
      content,
      imageUrl,
      category: values.category,
      tags,
    };
    setPreviewVisible(true);
    return previewData;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {editBlog ? "Edit Blog Post" : "Add New Blog Post"}
        </h1>
        <Button icon={<EyeOutlined />} onClick={showPreview}>
          Preview
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-4"
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="Enter blog title" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select a category">
            {categories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="summary"
          label="Summary"
          rules={[{ required: true, message: "Please enter a summary" }]}
        >
          <Input.TextArea
            placeholder="Enter blog summary (will be shown in blog cards)"
            rows={3}
          />
        </Form.Item>

        <Form.Item label="Content" required>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="h-64 mb-12"
          />
        </Form.Item>

        <Form.Item
          label="Featured Image"
          required
          help={
            !imageUrl && "Please upload a featured image for your blog post"
          }
          validateStatus={!imageUrl ? "error" : "success"}
        >
          <Upload
            accept="image/*"
            beforeUpload={handleImageUpload}
            showUploadList={false}
            disabled={uploadLoading}
          >
            <div className="space-y-4">
              {/* <Button
                icon={uploadLoading ? <LoadingOutlined /> : <UploadOutlined />}
                loading={uploadLoading}
                disabled={uploadLoading}
              >
                {uploadLoading ? "Uploading..." : "Upload Image"}
              </Button> */}
              {imageUrl ? (
                <div className="relative inline-block">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Featured"
                      className="max-w-xs rounded mt-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        message.error("Failed to load image");
                        setImageUrl("");
                      }}
                    />
                    {uploadLoading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                        <Spin size="large" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl("");
                      message.success("Image removed");
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4 p-8 border-2 hover:border-blue-500 border-dashed rounded-lg text-center">
                  <p className="text-gray-600">
                    Click or drag an image here to upload
                  </p>
                  <p className="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </Upload>
        </Form.Item>

        <Form.Item label="Tags">
          <Space wrap className="mb-2 bg-red-500">
            {tags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleTagClose(tag)}
                className="text-base bg-green-500 rouned-3xl py-1 px-5"
              >
                {tag}
              </Tag>
            ))}
            {inputVisible ? (
              <Input
                type="text"
                size="small"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputConfirm}
                onPressEnter={handleInputConfirm}
                className="w-24 bg-yellow-500"
                autoFocus
              />
            ) : (
              <Tag
                onClick={() => setInputVisible(true)}
                className="cursor-pointer text-base rounded-2xl -mt-1 py-1"
              >
                <PlusOutlined /> New Tag
              </Tag>
            )}
          </Space>
        </Form.Item>

        <Form.Item name="featured" valuePropName="checked">
          <Select defaultValue={false}>
            <Option value={true}>Featured Post</Option>
            <Option value={false}>Regular Post</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full"
          >
            {editBlog ? "Update" : "Publish"} Blog Post
          </Button>
        </Form.Item>
      </Form>

      <Modal
        title="Blog Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        <div className="prose max-w-none">
          <h1>{form.getFieldValue("title") || "Untitled"}</h1>
          {imageUrl && (
            <img src={imageUrl} alt="Featured" className="w-full rounded-lg" />
          )}
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </Modal>
    </div>
  );
};

export default AddBlog;
