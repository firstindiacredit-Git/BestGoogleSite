import React, { useState, useEffect, useRef } from "react";
import { MdAdd, MdDelete } from "react-icons/md";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);  
    const optionsRef = useRef(null); 

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

   useEffect(() => {
     const handleOutsideClick = (event) => {
       if (optionsRef.current && !optionsRef.current.contains(event.target)) {
         setShowOptions(false);
       }
     };

     if (showOptions) {
       document.addEventListener("mousedown", handleOutsideClick);
     } else {
       document.removeEventListener("mousedown", handleOutsideClick);
     }

     return () => {
       document.removeEventListener("mousedown", handleOutsideClick);
     };
   }, [showOptions]);

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
        <div className="border bg-white/10 border-gray-300 rounded-lg h-80 m-auto  w-full">
          <label htmlFor="file-input" className="cursor-pointer mb-4">
            <MdAdd className="w-12  justify-center mx-auto my-28  h-12 text-blue-600 hover:text-blue-800 transition duration-300" />
          </label>
        </div>
      )}

      {imageUrl && (
        <div className="mb-1">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-96 object-cover border border-gray-300 rounded-lg cursor-pointer"
            onClick={handleImageClick}
          />
        </div>
      )}

      {showOptions && (
        <div ref={optionsRef} className="flex items-center  ml-20 space-x-2">
          <button
            onClick={downloadImage}
            className="border border-blue-500 text-blue-500 p-0.5 rounded "
          >
            Download
          </button>
          <button
            onClick={removeImage}
            className="text-red-500 border p-0.5 rounded border-red-500 flex items-center"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
