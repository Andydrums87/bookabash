// components/ui/SnappyLoader.jsx
export const SnappyLoader = ({ 
    size = "w-24 h-24", 
    text = "Loading...", 
    className = "",
    showText = true 
  }) => {
    return (
      <div className={`text-center ${className}`}>
        <img 
          className={`${size} mx-auto`} 
          src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1756484328/snappy-loader-v4_pezslv.webp" 
          alt="Loading..." 
        />
        {showText && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    )
  }
  