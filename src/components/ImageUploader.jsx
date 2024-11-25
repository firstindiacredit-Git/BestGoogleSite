import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete } from "react-icons/md";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);  

  useEffect(() => {
     
    const storedImage = localStorage.getItem("uploadedImage");
    if (storedImage) {
      setImageUrl(storedImage);
      setImage({ name: "Uploaded Image", url: storedImage }); 
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
        setShowOptions(false); 
      };
      reader.readAsDataURL(file);  
    }
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = image.name;  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageClick = () => {
    setShowOptions(true); 
  };

  const removeImage = () => {
    setImage(null);
    setImageUrl("");
    localStorage.removeItem("uploadedImage");  
    setShowOptions(false);  
  };

  return (
    <div className="container -mt-6 w-full mx-auto py-10">
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden" 
        id="file-input" 
      />

     
      {!image && (
        <div className="border bg-white/10 border-gray-300 rounded-lg h-80 m-auto max-w-sm">
          <label htmlFor="file-input" className="cursor-pointer mb-4">
            <MdAdd className="w-12  justify-center mx-auto my-28  h-12 text-blue-600 hover:text-blue-800 transition duration-300" />
          </label>
        </div>
      )}

      
      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-96 object-cover border border-gray-300 rounded-lg cursor-pointer"
            onClick={handleImageClick}  
          />
        </div>
      )}

       
      {showOptions && (
        <div className="flex items-center ml-28 space-x-4">
          <button
            onClick={downloadImage}
            className="bg-blue-600 text-white px-2 py-2 rounded-lg transition duration-300 hover:bg-blue-700"
          >
            Download Image
          </button>
          <button
            onClick={removeImage}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
