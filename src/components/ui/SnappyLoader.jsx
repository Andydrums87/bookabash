"use client"

import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

export default function SnappyLoader({ text = "Loading..." }) {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://res.cloudinary.com/dghzq6xtd/raw/upload/v1756504250/snappy-head-nod_roivzc.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load animation:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!animationData) return null;

  return (
    <div className="flex flex-col items-center justify-center">
      <Lottie 
        animationData={animationData} 
        loop={true}
        style={{ height: 200, width: 200 }}
      />
      <p className="text-gray-600 text-lg font-medium text-center">
        {text}
      </p>
    </div>
  );
}