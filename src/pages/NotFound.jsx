import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const generateStars = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: `${Math.random() * 50}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 4,
    delay: Math.random() * 4,
    direction: Math.random() > 0.5 ? "topLeft" : "topRight",
  }));
};

const NotFound = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setStars(generateStars(30));
    const interval = setInterval(() => {
      setStars((prev) => [...prev.slice(-20), ...generateStars(10)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9770934.jpg-Wl31ERQfbntJABIblVId5PIBjqP5Gx.jpeg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* Falling Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute ${
              star.direction === "topLeft"
                ? "animate-fall-topLeft"
                : "animate-fall-topRight"
            }`}
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
            }}
          >
            <div className="h-full w-full rounded-full bg-white opacity-80" />
          </div>
        ))}
      </div>

      {/* UFO */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float-tilt">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8794272-p5k6GdbD8O2RIat5GWtUGJGkDgXoxf.png"
          alt="UFO"
          className="w-64 h-auto md:w-80"
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
        <h1 className="mb-2 text-7xl md:text-9xl font-bold text-white">404</h1>
        <p className="mb-8 text-xl md:text-2xl text-gray-300">
          Oops! Looks like this page got lost in space
        </p>
        <Link
          to="/"
          className="px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;