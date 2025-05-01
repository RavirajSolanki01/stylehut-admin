import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  images: string[];
}

const ImageHoverPreview: React.FC<Props> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000); // Change image every 1 second
    } else {
      setCurrentIndex(0); // Reset on hover out
    }

    return () => clearInterval(interval);
  }, [hovered, images]);

  if (!images.length) return <>-</>;

  return (
    <div
      className="h-16 w-16 overflow-hidden rounded border border-gray-200 shadow-md"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={images[currentIndex]}
        alt="Product"
        className="!h-full !w-full object-cover transition-opacity duration-300 ease-in-out"
        height={64}
        width={64}
      />
    </div>
  );
};

export default ImageHoverPreview;
