import { useState, useEffect, useCallback, useRef } from "react";
import { MdAdd, MdDelete, MdChevronLeft, MdChevronRight, MdPause, MdPlayArrow } from "react-icons/md";
import { Image, Button, Popconfirm, Modal, Tooltip } from "antd";
import Cropper from "react-easy-crop";
import { fetchAdminImages } from "../firebase/firestore";



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

const MAX_IMAGES = 5;
const ASPECT = 16 / 9;

function ImageUploader() {
  const [images, setImages] = useState([]);
 
  
  const [hiddenImageIds, setHiddenImageIds] = useState([]);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const [isLandscape, setIsLandscape] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadAllImages = async () => {
      try {
        const hiddenIds = JSON.parse(localStorage.getItem("hiddenAdminImages") || "[]");
        setHiddenImageIds(hiddenIds);

        const adminImages = await fetchAdminImages();
        const visibleAdminImages = adminImages.filter(img => !hiddenIds.includes(img.id));
        const adminImagesFormatted = visibleAdminImages.map(img => ({
          ...img,
          name: 'Admin Image',
          isLocal: false
        }));

        const stored = localStorage.getItem("uploadedImages");
        const localImages = stored ? JSON.parse(stored) : [];
        const localImagesFormatted = localImages.map(img => ({ ...img, isLocal: true, name: img.name || 'User Image' }));

        setImages([...adminImagesFormatted, ...localImagesFormatted]);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Failed to load admin images:", error);
        setIsInitialLoad(false);
      }
    };
    loadAllImages();
  }, []);

  useEffect(() => {
    // Only save to localStorage after initial load is complete
    if (!isInitialLoad) {
      const localImages = images.filter(img => img.isLocal);
      localStorage.setItem("uploadedImages", JSON.stringify(localImages));
    }
    
    if (images.length > 0 && activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [images, activeIndex, isInitialLoad]);

  const handleHideImage = (idToHide) => {
    const newHiddenIds = [...hiddenImageIds, idToHide];
    setHiddenImageIds(newHiddenIds);
    localStorage.setItem('hiddenAdminImages', JSON.stringify(newHiddenIds));
    setImages(images.filter(img => img.id !== idToHide));
  };

  // Carousel effect
  useEffect(() => {
    if (images.length > 1 && !previewOpen && !isPaused) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % images.length);
          setIsTransitioning(false);
        }, 500);
      }, 15000);
      return () => clearInterval(intervalRef.current);
    }
  }, [images.length, previewOpen, isPaused]);

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 0);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 0);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files).slice(0, MAX_IMAGES - images.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          // Detect if image is landscape or portrait
          const isLandscapeImage = img.width > img.height;
          setIsLandscape(isLandscapeImage);
          
          // Always show cropper for every uploaded image
          setTempImage(reader.result);
          setTempFileName(file.name);
          setShowCropper(true);
        };
      };
      reader.readAsDataURL(file);
    });
    event.target.value = null;
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImg = await getCroppedImg(tempImage, croppedAreaPixels);
     
      setImages((prev) => {
        const newArr = [{ name: tempFileName || "Cropped Image", url: croppedImg, isLocal: true }, ...prev];
        const finalArr = newArr.slice(0, MAX_IMAGES);
        // Immediately save to localStorage
        const localImages = finalArr.filter(img => img.isLocal);
        localStorage.setItem("uploadedImages", JSON.stringify(localImages));
        return finalArr;
      });
      // Set the new cropped image as the active image (first image)
      setActiveIndex(0);
      setShowCropper(false);
      setTempImage(null);
      setTempFileName("");
    } catch {
      alert("Failed to crop image");
    }
  };

  const removeActiveImage = () => {
    if (!images[activeIndex]) return;

    if (images[activeIndex].isLocal) {
      setImages((prev) => {
        const newArr = prev.filter((_, idx) => idx !== activeIndex);
        if (newArr.length === 0) setPreviewOpen(false);
        if (activeIndex >= newArr.length) setActiveIndex(0);
        // Immediately save to localStorage
        const localImages = newArr.filter(img => img.isLocal);
        localStorage.setItem("uploadedImages", JSON.stringify(localImages));
        return newArr;
      });
    }
    setPreviewOpen(false);
    setIsPaused(false); // <-- resume slideshow
  };
  
  
  const handleAddClick = () => {
    if (images.length >= MAX_IMAGES) {
      alert("You can't add more than five images");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  
  return (
    <div className="backdrop-blur-sm rounded-b-sm w-full">
      <style>{`.ant-image-preview-operations { background: #000 !important; }`}</style>
      <style>{`.ant-image-preview-close { background: #000 !important; }`}</style>
      <div>
        {images.length > 0 && (
          <div className="relative rounded-b-sm group h-[350px] flex items-center justify-center overflow-hidden bg-gray-900">
            {/* Arrows and Image display */}
            {images.length > 1 && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition opacity-0 group-hover:opacity-100"
                onClick={handlePrev}
                aria-label="Previous image"
                style={{ outline: 'none', border: 'none' }}
              >
                <MdChevronLeft className="w-7 h-7" />
              </button>
            )}
            {images.length > 1 && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition opacity-0 group-hover:opacity-100"
                onClick={handleNext}
                aria-label="Next image"
                style={{ outline: 'none', border: 'none' }}
              >
                <MdChevronRight className="w-7 h-7" />
              </button>
            )}
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].name}
              preview={{
                visible: previewOpen,
                src: images[activeIndex].url,
                onVisibleChange: (vis) => setPreviewOpen(vis),
              }}
              className={`rounded-b-sm transition-all duration-500 ease-out transform ${
                isTransitioning ? 'opacity-0 scale-105 translate-x-4' : 'opacity-100 scale-100 translate-x-0'
              }`}
              style={{ objectFit: "cover", height: "100%", width: "100%" }}
              wrapperClassName="!h-full !w-full rounded-b-sm"
              onClick={() => setPreviewOpen(true)}
              fallback={
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-white text-sm">Loading...</div>
                </div>
              }
            />

            {/* Action Buttons: Delete local OR Hide admin */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Pause/Play Button */}
              <Tooltip title={isPaused ? "Play" : "Pause"} placement="top">
                <Button
                  type="primary"
                  icon={isPaused ? <MdPlayArrow className="text-lg" /> : <MdPause className="text-lg" />}
                  className="flex items-center gap-1"
                  onClick={() => setIsPaused((prev) => !prev)}
                  style={{ marginRight: '0.25rem' }}
                ></Button>
              </Tooltip>
              {/* Delete/Hide Button */}
              {images[activeIndex]?.isLocal ? (
                <Popconfirm
                  title="Delete image"
                  description="Are you sure you want to delete this image?"
                  onConfirm={removeActiveImage}
                  okText="Yes"
                  cancelText="No"
                  placement="leftTop"
                  onOpenChange={(visible) => {
                    if (visible) setIsPaused(true);
                    else setIsPaused(false);
                  }}
                >
                  <Tooltip title="Delete" placement="top">
                    <Button
                      type="primary"
                      icon={<MdDelete className="text-lg" />}
                      className="flex items-center gap-1"
                    ></Button>
                  </Tooltip>
                </Popconfirm>
              ) : (
                <Popconfirm
                  title="Hide image?"
                  description="This hides the image from your view only."
                  onConfirm={() => handleHideImage(images[activeIndex].id)}
                  okText="Hide"
                  cancelText="No"
                  placement="leftTop"
                >
                  <Tooltip title="Hide" placement="top">
                    <Button
                      type="primary"
                      icon={<MdDelete className="text-lg" />}
                      className="flex items-center gap-1"
                    ></Button>
                  </Tooltip>
                </Popconfirm>
              )}

              {/* Add Button */}
              <Tooltip title={images.length >= MAX_IMAGES ? "Maximum 5 images allowed" : "Add Image"} placement="top">
                <Button
                  type="primary"
                  icon={<MdAdd className="text-lg" />}
                  className={`flex items-center gap-1 ${images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleAddClick}
                ></Button>
              </Tooltip>
            </div>
            
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
              disabled={images.length >= MAX_IMAGES}
              id="file-input-inline"
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((img, idx) => (
                <span
                  key={idx}
                  className={`inline-block w-2 h-2 rounded-full transition-all duration-500 ease-out ${
                    idx === activeIndex ? "bg-indigo-600 scale-125" : "bg-gray-400 scale-100"
                  } cursor-pointer`}
                  onClick={() => setActiveIndex(idx)}
                ></span>
              ))}
            </div>
          </div>
        )}
        {images.length === 0 && (
          <div className="h-32 flex items-center justify-center dark:bg-[#28283A]/[var(--widget-opacity)] rounded-sm w-full mb-2">
            <div 
              className="cursor-pointer flex flex-col items-center"
              onClick={handleAddClick}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="file-input"
                ref={fileInputRef}
                disabled={images.length >= MAX_IMAGES}
              />
              <MdAdd className="w-12 h-12 text-indigo-600 hover:text-indigo-800 transition duration-300" />
              <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Click to upload image(s)
              </span>
            </div>
          </div>
        )}
      </div>
      <Modal
        open={showCropper}
        onCancel={() => setShowCropper(false)}
        onOk={handleCropSave}
        okText="Crop & Save"
        cancelText="Cancel"
        width={400}
        title={isLandscape ? "Crop Landscape Image" : "Crop Portrait Image"}
        footer={[
          <Button key="back" onClick={() => setShowCropper(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCropSave}>
            Crop & Save
          </Button>,
        ]}
      >
        <div style={{ 
          position: 'relative', 
          width: '292px', 
          height: '350px', 
          background: isLandscape ? '#1a1a1a' : '#222',
          borderRadius: '8px',
          overflow: 'hidden',
          margin: '0 auto'
        }}>
          <Cropper
            image={tempImage}
            crop={crop}
            zoom={zoom}
            aspect={292/350}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                width: '292px',
                height: '350px',
                backgroundColor: isLandscape ? '#1a1a1a' : '#222',
              },
              cropAreaStyle: {
                border: isLandscape ? '2px solid #4f46e5' : '2px solid #6366f1',
                color: isLandscape ? 'rgba(79, 70, 229, 0.3)' : 'rgba(99, 102, 241, 0.3)',
              },
              mediaStyle: {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              },
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default ImageUploader;