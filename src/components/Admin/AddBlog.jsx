import React, { useState } from "react";
import { Form, Input, Button, message, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Option } = Select;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const categories = [
  "Business Finance",
  "Expense Management",
  "Bookkeeping",
  "Tax Tips",
  "Business Growth",
  "Financial Planning",
];

const AddBlog = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const uploadImage = async (file) => {
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      if (data.secure_url) {
        message.success("Image uploaded successfully!");
        return data.secure_url;
      } else {
        throw new Error("Upload failed: No secure URL received");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error(error.message || "Failed to upload image");
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!imageUrl) {
      message.error("Please upload a featured image");
      return;
    }

    if (!content) {
      message.error("Please add blog content");
      return;
    }

    try {
      setLoading(true);

      // Calculate estimated read time (rough estimate: 200 words per minute)
      const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200)) + " min read";

      const blogPost = {
        title: values.title,
        summary: values.summary,
        content: content,
        category: values.category,
        featuredImage: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        author: "Admin", // You can get this from auth context if needed
        readTime: readTime,
        featured: values.featured || false,
        status: "published",
      };

      await addDoc(collection(db, "blogs"), blogPost);
      message.success("Blog post created successfully!");
      form.resetFields();
      setContent("");
      setImageUrl("");
    } catch (error) {
      console.error("Error creating blog post:", error);
      message.error("Failed to create blog post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
      const url = await uploadImage(file);
      if (url) {
        setImageUrl(url);
      }
    } catch (error) {
      message.error("Failed to upload image");
    }
    return false;
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Blog Post</h1>
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

        <Form.Item label="Featured Image">
          <Upload
            accept="image/*"
            beforeUpload={handleImageUpload}
            showUploadList={false}
            disabled={uploadLoading}
          >
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Featured"
                  className="max-w-xs rounded"
                />
                <Button
                  type="text"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageUrl("");
                  }}
                  disabled={uploadLoading}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button icon={<UploadOutlined />} loading={uploadLoading}>
                {uploadLoading ? "Uploading..." : "Upload Featured Image"}
              </Button>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          label="Content"
          required
          help="Write your blog content here. You can use the toolbar for formatting."
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="h-64 mb-12"
          />
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
            Publish Blog Post
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddBlog;
