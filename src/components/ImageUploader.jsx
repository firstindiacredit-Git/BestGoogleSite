import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete } from "react-icons/md";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false); // State to manage visibility of download options

  useEffect(() => {
    // Load image from local storage when the component mounts
    const storedImage = localStorage.getItem("uploadedImage");
    if (storedImage) {
      setImageUrl(storedImage);
      setImage({ name: "Uploaded Image", url: storedImage }); // Simulating file object for easier handling
    }
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setImage({ name: file.name, url: reader.result }); // Store the image as an object with a name
        localStorage.setItem("uploadedImage", reader.result); // Store image in local storage
        setShowOptions(false); // Hide options when a new image is uploaded
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = image.name; // Set the download name to the original file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageClick = () => {
    setShowOptions(true); // Show options when the image is clicked
  };

  const removeImage = () => {
    setImage(null);
    setImageUrl("");
    localStorage.removeItem("uploadedImage"); // Remove image from local storage
    setShowOptions(false); // Hide options when the image is removed
  };

  return (
    <div className="container w-full mx-auto py-10">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden" // Hide the input field
        id="file-input" // Add an ID for reference
      />

      {/* Conditionally render the add icon button */}
      {!image && (
        <div className="border border-gray-300 rounded-lg h-80 m-auto max-w-sm">
          <label htmlFor="file-input" className="cursor-pointer mb-4">
            <MdAdd className="w-12  justify-center mx-auto my-28  h-12 text-blue-600 hover:text-blue-800 transition duration-300" />
          </label>
        </div>
      )}

      {/* Image preview */}
      {imageUrl && (
        <div className="mb-4">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-full h-96 object-cover border border-gray-300 rounded-lg cursor-pointer"
            onClick={handleImageClick} // Open options on image click
          />
        </div>
      )}

      {/* Show download button and remove/change options if image is present */}
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
