import { useState, useEffect } from "react";
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import './slider.css';

const images = [
  "/images/team-artisans.jpg",
  "/images/worker-machine.jpg",
  "/images/estheticienne.jpg"
];

export default function Slider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="slider-container">
      <div className="slider">
        <div
          className="slider-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((img, i) => (
            <div className="slide" key={i}>
              <img src={img} alt={`Artisan ${i + 1}`} />
            </div>
          ))}
        </div>

        <button className="slider-btn prev" onClick={prevSlide} aria-label="Précédent">
          <FiChevronLeft size={24} />
        </button>
        <button className="slider-btn next" onClick={nextSlide} aria-label="Suivant">
          <FiChevronRight size={24} />
        </button>

        <div className="slider-dots">
          {images.map((_, i) => (
            <div
              key={i}
              className={`slider-dot ${index === i ? "active" : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}