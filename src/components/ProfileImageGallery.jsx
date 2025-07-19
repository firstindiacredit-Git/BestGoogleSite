import { useState, useEffect } from 'react';
import { Image, Spin } from 'antd';
import { fetchProfileImages } from '../firebase/firestore';

function ProfileImageGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    setLoading(true);
    try {
      const imgs = await fetchProfileImages();
      setImages(imgs.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    } catch {
      console.error('Failed to load profile images');
    }
    setLoading(false);
  }

  if (loading) {
    return <Spin className="flex justify-center p-8" />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {images.map((img) => (
        <div key={img.id} className="relative group rounded-lg overflow-hidden shadow-md">
          <Image 
            src={img.url} 
            alt={img.title} 
            className="rounded-lg"
            style={{ width: '100%', height: 200, objectFit: 'cover' }} 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <div className="text-white text-center p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <h3 className="font-bold text-lg">{img.title}</h3>
              {img.description && (
                <p className="text-sm mt-2">{img.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProfileImageGallery;