import { useState, useEffect, useCallback, useRef } from "react";
import { MdAdd, MdDelete, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Image, Button, Popconfirm, Modal } from "antd";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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
      } catch (error) {
        console.error("Failed to load admin images:", error);
      }
    };
    loadAllImages();
  }, []);

  useEffect(() => {
    const localImages = images.filter(img => img.isLocal);
    localStorage.setItem("uploadedImages", JSON.stringify(localImages));
    if (images.length > 0 && activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [images, activeIndex]);

  const handleHideImage = (idToHide) => {
    const newHiddenIds = [...hiddenImageIds, idToHide];
    setHiddenImageIds(newHiddenIds);
    localStorage.setItem('hiddenAdminImages', JSON.stringify(newHiddenIds));
    setImages(images.filter(img => img.id !== idToHide));
  };

  // Carousel effect
  useEffect(() => {
    if (images.length > 1 && !previewOpen) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % images.length);
          setIsTransitioning(false);
        }, 500);
      }, 15000);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [images.length, previewOpen]);

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
          if (img.width > img.height) {
            setImages((prev) => {
              const newArr = [...prev, { name: file.name, url: reader.result, isLocal: true }];
              return newArr.slice(0, MAX_IMAGES);
            });
          } else {
            setTempImage(reader.result);
            setTempFileName(file.name);
            setShowCropper(true);
          }
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
        const newArr = [...prev, { name: tempFileName || "Cropped Image", url: croppedImg, isLocal: true }];
        return newArr.slice(0, MAX_IMAGES);
      });
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
        return newArr;
      });
    }
    setPreviewOpen(false);
  };
  
  const handleAddClick = () => {
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
          <div className="relative rounded-b-sm group h-[20.25rem] flex items-center justify-center overflow-hidden">
            {/* Arrows and Image display */}
            {images.length > 1 && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition"
                onClick={handlePrev}
                aria-label="Previous image"
                style={{ outline: 'none', border: 'none' }}
              >
                <MdChevronLeft className="w-7 h-7" />
              </button>
            )}
            {images.length > 1 && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition"
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
            />

            {/* Action Buttons: Delete local OR Hide admin */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {images[activeIndex]?.isLocal ? (
                <Popconfirm
                  title="Delete image"
                  description="Are you sure you want to delete this image?"
                  onConfirm={removeActiveImage}
                  okText="Yes"
                  cancelText="No"
                  placement="leftTop"
                >
                  <Button
                    type="primary"
                    icon={<MdDelete className="text-lg" />}
                    className="flex items-center gap-1"
                  ></Button>
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
                   <Button
                    type="primary"
                    icon={<MdDelete className="text-lg" />}
                    className="flex items-center gap-1"
                  ></Button>
                </Popconfirm>
              )}

              {images.length < MAX_IMAGES && (
                <Button
                  type="primary"
                  icon={<MdAdd className="text-lg" />}
                  className="flex items-center gap-1"
                  onClick={handleAddClick}
                ></Button>
              )}
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
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => (
                <span
                  key={idx}
                  className={`inline-block w-3 h-3 rounded-full transition-all duration-500 ease-out ${
                    idx === activeIndex ? "bg-indigo-600 scale-125" : "bg-gray-400 scale-100"
                  }`}
                ></span>
              ))}
            </div>
          </div>
        )}
        {images.length === 0 && images.length < MAX_IMAGES && (
          <div className="h-32 flex items-center justify-center dark:bg-[#28283A]/[var(--widget-opacity)] rounded-sm w-full mb-2">
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="file-input"
                disabled={images.length >= MAX_IMAGES}
              />
              <MdAdd className="w-12 h-12 text-indigo-600 hover:text-indigo-800 transition duration-300" />
              <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Click to upload image(s)
              </span>
            </label>
          </div>
        )}
      </div>
      <Modal
        open={showCropper}
        onCancel={() => setShowCropper(false)}
        onOk={handleCropSave}
        okText="Crop & Save"
        cancelText="Cancel"
        width={600}
        footer={[
          <Button key="back" onClick={() => setShowCropper(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCropSave}>
            Crop & Save
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

export default ImageUploader;

