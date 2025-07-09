import { useState, useEffect, useCallback } from 'react';
import { Button, Image, Popconfirm, Upload, message, Spin, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import Cropper from 'react-easy-crop';
import { CLOUDINARY_CONFIG, getCloudinaryUploadUrl } from '../../config/cloudinary';
import { addAdminImage, fetchAdminImages, deleteAdminImage } from '../../firebase/firestore';

const MAX_IMAGES = 10;
const ASPECT = 16 / 9;

function getCroppedImg(imageSrc, crop) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
      resolve(canvas.toDataURL('image/jpeg'));
    };
    image.onerror = (e) => reject(e);
  });
}

function ImageAdminUpload() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [tempFile, setTempFile] = useState(null);

  // Fetch admin images on mount and handle refresh
  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    setError(null);
    try {
      const imgs = await fetchAdminImages();
      if (!imgs) {
        throw new Error('No images returned');
      }
      setImages(imgs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch (err) {
      console.error('Failed to load images:', err);
      setError('Failed to load images. Please try again.');
      message.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }

  // Handle file selection and show cropper
  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result);
      setTempFile(file);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Upload cropped image to Cloudinary
  const handleCropSave = async () => {
    setLoading(true);
    try {
      const croppedImg = await getCroppedImg(tempImage, croppedAreaPixels);
      // Convert base64 to blob
      const res = await fetch(croppedImg);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', blob, tempFile.name || 'cropped.jpg');
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      const uploadRes = await fetch(getCloudinaryUploadUrl(), {
        method: 'POST',
        body: formData,
      });
      const data = await uploadRes.json();
      if (data.secure_url) {
        await addAdminImage(data.secure_url);
        message.success('Image uploaded!');
        setShowCropper(false);
        setTempImage(null);
        setTempFile(null);
        loadImages();
      } else {
        throw new Error('Cloudinary upload failed');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      message.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete image
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteAdminImage(id);
      message.success('Image deleted');
      loadImages();
    } catch (err) {
      console.error('Delete failed:', err);
      message.error('Delete failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    loadImages();
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Admin Image Upload</h2>
        <Button 
          onClick={handleRefresh} 
          icon={<ReloadOutlined />}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Upload
        showUploadList={false}
        accept="image/*"
        beforeUpload={handleBeforeUpload}
        disabled={loading || images.length >= MAX_IMAGES}
      >
        <Button type="primary" icon={<PlusOutlined />} disabled={loading || images.length >= MAX_IMAGES}>
          Upload Image
        </Button>
      </Upload>

      {loading && <Spin className="flex justify-center my-8" />}
      
      {error && !loading && (
        <div className="text-red-500 my-4 flex justify-center">
          <div className="flex flex-col items-center">
            <p>{error}</p>
            <Button onClick={handleRefresh} type="link">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="my-8 text-center text-gray-500">No images uploaded yet</div>
      )}

      {!loading && !error && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <Image 
                src={img.url} 
                alt="Admin Upload" 
                className="rounded" 
                style={{ width: '100%', height: 150, objectFit: 'cover' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADA..."
              />
              <Popconfirm
                title="Delete image?"
                onConfirm={() => handleDelete(img.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined />}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                  size="small"
                />
              </Popconfirm>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showCropper}
        onCancel={() => setShowCropper(false)}
        onOk={handleCropSave}
        okText="Crop & Upload"
        cancelText="Cancel"
        width={600}
        footer={[
          <Button key="back" onClick={() => setShowCropper(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCropSave}>
            Crop & Upload
          </Button>,
        ]}
      >
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#222' }}>
          <Cropper
            image={tempImage}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      </Modal>
    </div>
  );
}

export default ImageAdminUpload;
