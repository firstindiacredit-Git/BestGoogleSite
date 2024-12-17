import React, { useState, useEffect, useRef } from "react";
import { MdAdd, MdDelete } from "react-icons/md";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("uploadedImage");
    const imageTrue = localStorage.getItem("imageTrue");
    if (storedImage && imageTrue === "true") {
      setImageUrl(storedImage);
      setImage({ name: "Uploaded Image", url: storedImage });
    } else {
      setImageUrl(null); // Hide image when not signed in
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
        setShowOptions(false);
      };
      reader.readAsDataURL(file);
    }
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
    <div className="container rounded-md  -mt-6 w-full mx-auto py-10">
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
        <>
          <div className="mb-1 rounded-md  relative">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-96 object-cover border border-gray-300 rounded-lg cursor-pointer"
              onClick={handleImageClick}
            />
            {showOptions && (
              <div
                ref={optionsRef}
                className=" absolute flex p-2 items-center justify-center inset-0 rounded-md backdrop-blur-lg z-99 bg-black/10 left-0 top-0 space-x-2"
              >
                <div className="bg-white rounded-lg p-5 ">
                  <div className="mb-3 lg:text-md text-sm">
                    Do you want to remove the image?
                  </div>
                  <div className="flex lg:flex-row flex-col gap-2  justify-between">
                    <button
                      onClick={() => {
                        setShowOptions(!showOptions);
                      }}
                      className="text-gray-500 lg:text-md text-sm transition duration-200 hover:bg-gray-500 hover:text-white border  px-2 py-0.5 rounded border-gray-500 bg-gray-100"
                    >
                      No, Cancel
                    </button>
                    <button
                      onClick={removeImage}
                      className="text-red-500 lg:text-md text-sm transition duration-200 hover:bg-red-500 hover:text-white border  px-2 py-0.5 rounded border-red-500 bg-red-100"
                    >
                      Yes, Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageUploader;
