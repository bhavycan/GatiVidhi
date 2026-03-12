import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react'
import { usePopcard } from '../context/PopCardContext';

const Share = ({ update }) => {
  const { showPopcard } = usePopcard();
  const [isShareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const media = [
    { src: '/images/logos/whatshapp.png', label: 'WhatsApp' },
    { src: '/images/logos/facebook.png', label: 'Facebook' },
    { src: '/images/logos/x.png', label: 'X' },
    { src: '/images/logos/copy.png', label: 'Copy' },
  ];

  const getShareText = () => {
    const date = update?.createdAt
      ? new Date(update.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    const lines = ['🏠 Interior Project Update'];
    if (date) lines.push(`📅 ${date}`);
    if (update?.workDone) lines.push(`✅ Work Done:\n${update.workDone}`);
    if (update?.workLeft) lines.push(`⏳ Work Left:\n${update.workLeft}`);
    if (update?.notes) lines.push(`📝 Notes:\n${update.notes}`);
    if (update?.images?.length) lines.push(`🖼️ Photos:\n${update.images.join('\n')}`);
    return lines.join('\n\n');
  };

  const handleShare = async (label) => {
    const text = getShareText();
    const encoded = encodeURIComponent(text);

    if (label === 'WhatsApp') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    } else if (label === 'Facebook') {
      const url = encodeURIComponent(update?.images?.[0] || window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encoded}`, '_blank');
    } else if (label === 'X') {
      window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
    } else if (label === 'Copy') {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback for older browsers
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDrag = (e, info) => {
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
      if (info.offset.y > 5) setShareOpen(false);
    }
  };

  useEffect(() => {
    if (isShareOpen) {
      showPopcard("Share");
    } else {
      showPopcard("", false);
    }
    return () => {
      showPopcard("", false);
    };
  }, [isShareOpen]);

  return (
    <>
      <button onClick={() => setShareOpen(true)} className='w-[50%] px-2 py-2 bg-[#883bbc] text-white rounded-md h-full'>
        <i className="ri-share-fill text-2xl"></i>
      </button>

      <AnimatePresence>
        {isShareOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShareOpen(false)}
            transition={{ duration: .2, ease: "easeInOut" }}
            className='fixed inset-0 z-10 px-4 bg-gradient-to-tr from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90'>
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              drag="y"
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 250 }}
              dragElastic={0}
              onDragEnd={(e, info) => handleDrag(e, info)}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: .2, ease: "easeInOut" }}
              className="share-box w-[100%] px-4 py-5 h-[25%] pb-[2%] border-t-2 border-l-2 border-r-2 border-[#883bbc] backdrop-blur-sm rounded-t-4xl">

              <div className="title w-full h-[50%] pb-[5%] border-b-2 border-white font-semibold">
                <h1 className='text-4xl'>Share <span className='inline-block text-white'>It</span>.</h1>
                <h3 className='opacity-80 font-bold'>share this update with your loved ones!</h3>
              </div>

              <div className="div w-full border-1 border-white h-[40%] mt-[5%] rounded-md flex items-center justify-between px-2 py-2">
                {media.map((item, index) => (
                  <div key={index} className="w-[23%] h-full flex flex-col items-center gap-1 relative">
                    <button
                      onClick={() => handleShare(item.label)}
                      className="w-full h-full rounded-md overflow-hidden active:scale-90 transition-transform">
                      <img className='w-full h-full object-contain' src={item.src} alt={item.label} />
                    </button>
                    {item.label === 'Copy' && copied && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className='text-xs font-bold text-[#883bbc] absolute -bottom-5'>
                        Copied!
                      </motion.span>
                    )}
                  </div>
                ))}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Share;