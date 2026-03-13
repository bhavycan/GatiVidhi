import { AnimatePresence, motion } from "motion/react";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const clampOffset = (x, y, scale, imgSize, containerSize = null) => {
  if (scale <= 1) return { x: 0, y: 0 }; // No offset needed when not zoomed
  
  const scaledWidth = imgSize.width * scale;
  const scaledHeight = imgSize.height * scale;
  
  // Calculate how much the scaled image overflows beyond the original size
  const overflowX = Math.max((scaledWidth - imgSize.width) / 2, 0);
  const overflowY = Math.max((scaledHeight - imgSize.height) / 2, 0);

  return {
    x: clamp(x, -overflowX, overflowX),
    y: clamp(y, -overflowY, overflowY),
  };
};

const ImagePortal = ({ tapNumber, setTap, images: imagesProp }) => {
  const [iscurr, setcurr] = useState(tapNumber);
  const [isMenu, setMenu] = useState(true);
  const [isZoomMode, setZoomMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [startDist, setStartDist] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [isDragMode, setDragMode] = useState(true);
  const [lastTap, setLastTap] = useState(0);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const resetZoom = () => {
    setZoomMode(false);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setDragMode(true); // Ensure drag mode is always enabled when zoom is off
  };

  useEffect(() => {
    setcurr(tapNumber);
    resetZoom();
  }, [tapNumber]);

  useEffect(() => {
    const updateSizes = () => {
      if (imgRef.current && containerRef.current) {
        const { offsetWidth: imgWidth, offsetHeight: imgHeight } = imgRef.current;
        const { offsetWidth: containerWidth, offsetHeight: containerHeight } = containerRef.current;
        
        setImgSize({ width: imgWidth, height: imgHeight });
        setContainerSize({ width: containerWidth, height: containerHeight });
      }
    };
    
    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [iscurr]);

  useEffect(() => {
    if (isMenu && !isZoomMode) {
      const timeout = setTimeout(() => {
        setMenu(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isMenu, isZoomMode]);

  const handleDrag = (e, info) => {
    if (!isDragMode || isZoomMode) return;
    
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      if (Math.abs(info.offset.y) > 50) {
        setTap(false);
      }
    } else {
      if (info.offset.x > 50) {
        setcurr((prev) => (prev - 1 + images.length) % images.length);
      } else if (info.offset.x < -50) {
        setcurr((prev) => (prev + 1) % images.length);
      }
    }
  };

  const handleDoubleClick = () => {
    if (isZoomMode) {
      // Exit zoom mode and enable drag mode
      resetZoom();
      setMenu(true); // Show menu when exiting zoom mode
      console.log("Zoom mode deactivated - Drag mode enabled");
    } else {
      // Enter zoom mode and disable drag mode
      setZoomMode(true);
      setDragMode(false);
      setScale(2.5);
      setMenu(false); // Hide menu when entering zoom mode
      console.log("Zoom mode activated - Drag mode disabled");
    }
  };

  const handleImageClick = (e) => {
    
    const now = Date.now();
    const DOUBLE_CLICK_DELAY = 300;
    
    if (now - lastTap < DOUBLE_CLICK_DELAY) {
      handleDoubleClick();
    }
    setLastTap(now);
  };

  const handleTouchStart = (e) => {
    
    
    if (e.touches.length === 2) {
      // Two finger pinch zoom
      setDragMode(false);
      setZoomMode(true);
      setIsZooming(true);
      
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      setStartDist(dist);
      setInitialScale(scale);
      
    } else if (e.touches.length === 1) {
      if (isZoomMode && scale > 1) {
        // Single finger pan in zoom mode
        setStartOffset({
          x: e.touches[0].clientX - offset.x,
          y: e.touches[0].clientY - offset.y,
        });
      }
    }
  };

  const handleTouchMove = (e) => {
    
    
    if (isZooming && e.touches.length === 2) {
      // Handle pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      
      if (startDist > 0) {
        const scaleRatio = newDist / startDist;
        const newScale = clamp(initialScale * scaleRatio, 1, 4);
        setScale(newScale);
      }
    } else if (e.touches.length === 1 && isZoomMode && scale > 1) {
      // Handle panning in zoom mode with proper boundary checking
      const newX = e.touches[0].clientX - startOffset.x;
      const newY = e.touches[0].clientY - startOffset.y;
      const clamped = clampOffset(newX, newY, scale, imgSize, containerSize);
      setOffset(clamped);
    }
  };

  const handleTouchEnd = (e) => {
    
    
    setIsZooming(false);
    setStartDist(0);
    
    // If scale is very close to 1, exit zoom mode and enable drag mode
    if (scale <= 1.1) {
      resetZoom(); // This will set dragMode to true
      console.log("Auto-exiting zoom mode - Drag mode enabled");
    }
  };

  // Handle mouse events for desktop
  const handleMouseDown = (e) => {
    if (isZoomMode && scale > 1) {
      setStartOffset({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
      
      const handleMouseMove = (e) => {
        const newX = e.clientX - startOffset.x;
        const newY = e.clientY - startOffset.y;
        const clamped = clampOffset(newX, newY, scale, imgSize, containerSize);
        setOffset(clamped);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const images = imagesProp?.length > 0 ? imagesProp : [
    "https://images.unsplash.com/photo-1629746958979-08060ed5bf0b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1626367771676-96d7bf35953f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1636071659185-5e2b6596a42c?q=80&w=1246&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1623434049228-b9146d9b1be6?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1719002906692-32dcef8010e7?q=80&w=606&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.2 }}
      className="w-full h-full bg-black/50 inset-0 fixed top-0 left-0 z-50"
    >
      <div className="w-full h-full absolute top-[5%] left-0 -z-10">
        <img src="/GIF/butterflies.gif" alt="Background animation" />
      </div>
      
      <motion.div
        onClick={() => setTap(false)}
        className="w-screen h-screen bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-center bg-opacity-90"
      >
        <div
          className="w-screen h-[100%] flex flex-col justify-center items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.figure
            drag={isDragMode && !isZoomMode}
            dragMomentum={false}
            onClick={() => !isZoomMode && setMenu(!isMenu)} // Only toggle menu when not in zoom mode
            dragDirectionLock={true}
            dragConstraints={{
              top: -200,
              left: 0,
              right: 0,
              bottom: 200,
            }}
            dragSnapToOrigin={true}
            onDragEnd={handleDrag}
            ref={containerRef}
            className="w-auto h-auto max-w-[90vw] max-h-[70vh] overflow-hidden rounded-lg shadow-lg"
            animate={isDragMode ? {} : { x: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.img
              className="w-full h-full object-contain select-none"
              src={images[iscurr]}
              ref={imgRef}
              alt={`Image ${iscurr + 1}`}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transition: isZooming ? "none" : "transform 0.2s ease-out",
                touchAction: "none",
                cursor: isZoomMode ? (scale > 1 ? 'grab' : 'zoom-out') : 'pointer',
              }}
              onClick={handleImageClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onDragStart={(e) => e.preventDefault()}
            />
          </motion.figure>
          
          {/* Image counter */}
          <div className="mt-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
            {iscurr + 1} / {images.length}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isMenu && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full backdrop-blur-sm border-t border-[#883bbc] rounded-t-3xl px-4 py-5 bg-gradient-to-tr from-white/20 to-transparent h-[18%] absolute bottom-0 left-0 z-10"
          >
            <div className="title w-full pb-[2%] border-b-2 border-white/50 font-semibold">
              <h1 className="text-4xl text-white">
                Play<span className="text-[#883bbc]">Ground</span>
              </h1>
            </div>

            <div className="w-full mt-[3%] gap-[2%] flex justify-between items-center">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex-1 h-12 rounded-lg text-white flex items-center justify-center bg-[#883bbc] cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isZoomMode) {
                    resetZoom(); // This will enable drag mode
                    setMenu(true); // Show menu when manually exiting zoom
                    console.log("Manual zoom exit - Drag mode enabled");
                  } else {
                    setZoomMode(true);
                    setDragMode(false);
                    setScale(2.5);
                    setMenu(false); // Hide menu when entering zoom
                    console.log("Manual zoom enter - Drag mode disabled");
                  }
                }}
              >
                {!isZoomMode ? (
                  <i className="ri-zoom-in-fill text-2xl"></i>
                ) : (
                  <i className="ri-zoom-out-fill text-2xl"></i>
                )}
              </motion.div>
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTap(false);
                }}
                className="flex-1 h-12 rounded-lg text-white flex items-center justify-center bg-[#883bbc] cursor-pointer mx-2"
              >
                <i className="ri-arrow-left-line text-2xl"></i>
              </motion.div>
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex-1 h-12 rounded-lg text-white flex items-center justify-center bg-[#883bbc] cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="ri-download-fill text-2xl"></i>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
};

export default ImagePortal;