import { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);

        // Recognize text from image using Tesseract
        Tesseract.recognize(file, 'eng', {
          logger: (m) => console.log(m),
        })
          .then(({ data: { text } }) => {
            setText(text);
          })
          .catch((error) => console.error(error));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;

      // Render image and overlay text
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Customize text rendering
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(text, 50, 50); // Example text positioning
      };
    }
  }, [image, text]);

  // Handle download of the modified image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'modified-image.png';
    link.click();
  };

  return (
    <div className="container mx-auto">
      <input
        type="file"
        onChange={handleImageUpload}
        accept="image/*"
        className="mt-4"
      />
      
      {/* Textarea for editing extracted text */}
      {text && (
        <textarea
          className="mt-4 p-2 border w-full"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}
      
      {/* Canvas to render image and text */}
      <canvas ref={canvasRef} className="mt-4"></canvas>
      
      {/* Button to download the modified image */}
      <button
        onClick={handleDownload}
        className="mt-4 bg-blue-500 text-white p-2 rounded"
      >
        Download Image
      </button>
    </div>
  );
}

export default App;
