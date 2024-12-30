import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import { Image, Button, Popconfirm } from "antd";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const storedImage = localStorage.getItem("uploadedImage");
    const imageTrue = localStorage.getItem("imageTrue");
    if (storedImage && imageTrue === "true") {
      setImageUrl(storedImage);
      setImage({ name: "Uploaded Image", url: storedImage });
    } else {
      setImageUrl(null);
      setImage(null);
    }
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setImage({ name: file.name, url: reader.result });
        localStorage.setItem("uploadedImage", reader.result);
        localStorage.setItem("imageTrue", true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageUrl("");
    localStorage.removeItem("uploadedImage");
    localStorage.removeItem("imageTrue");
  };

  return (
    <div className="container rounded-md w-full">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="file-input"
      />

      {!image && (
        <div className="border bg-white/10 h-80 m-auto w-full">
          <label htmlFor="file-input" className="cursor-pointer mb-4">
            <MdAdd className="w-12 justify-center mx-auto my-28 h-12 text-blue-600 hover:text-blue-800 transition duration-300" />
          </label>
        </div>
      )}

      {imageUrl && (
        <div className="relative group h-80">
          <Image
            src={imageUrl}
            alt="Uploaded"
            preview={true}
            className="!h-full !w-full"
            style={{ 
              objectFit: 'cover',
              height: '100%',
              width: '100%'
            }}
            wrapperClassName="!h-full !w-full"
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Popconfirm
              title="Delete image"
              description="Are you sure you want to delete this image?"
              onConfirm={removeImage}
              okText="Yes"
              cancelText="No"
              placement="leftTop"
            >
              <Button 
                type="primary" 
                danger
                icon={<MdDelete className="text-lg" />}
                className="flex items-center gap-1"
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
