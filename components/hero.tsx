'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const handleBuyNow = () => {
    const section = document.getElementById('products-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  // Parallax refs
  const bgRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable parallax on screens >= 768px (not mobile)
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Parallax speeds (increased for more pronounced effect)
      const bgSpeed = 0.6;
      const imgSpeed = 0.3;
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${scrollY * bgSpeed}px)`;
      }
      if (imgRef.current) {
        imgRef.current.style.transform = `translateY(${scrollY * imgSpeed}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative flex flex-col-reverse lg:flex-row w-full min-h-[60vh] lg:min-h-[70vh] items-center justify-between overflow-hidden py-8 md:py-16 mb-8 md:mb-12 px-2 md:px-8">
      {/* Gold background with diagonal edge */}
      <div
        ref={bgRef}
        className="absolute left-0 top-0 h-full w-full lg:w-[55vw] z-0 will-change-transform"
        style={{
          clipPath: 'polygon(0 0, 90% 0, 80% 100%, 0% 100%)',
          background: '#D4AF37',
          transition: 'width 0.3s',
        }}
      />
      {/* Left content */}
      <div className="relative z-10 flex-1 flex flex-col items-center lg:items-start justify-center py-12 px-6 lg:px-12 w-full lg:w-1/2 h-full text-white text-center lg:text-left">
        <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-4" style={{letterSpacing: '0.01em'}}>
          ALL<br />IN<br />ONE<br />SHOP
        </h1>
        <p className="mb-6 text-lg lg:text-xl font-medium opacity-90">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </p>
        <button
          onClick={handleBuyNow}
          className="bg-gold text-black font-bold px-8 py-3 rounded shadow hover:bg-white hover:text-gold transition-colors text-lg"
        >
          BUY NOW
        </button>
      </div>
      {/* Right: Static image, mirroring the orange section */}
      <div className="relative z-20 flex-1 flex items-center justify-center w-full lg:w-1/2 h-full min-h-[300px] bg-transparent">
        <div
          ref={imgRef}
          className="relative aspect-square w-56 h-56 lg:w-[28vw] lg:h-[28vw] max-w-[420px] max-h-[420px] flex items-center justify-center  z-30 transition-all will-change-transform"
        >
          <Image
            src="https://wallpapers.com/images/hd/black-quilted-designer-purse-jrzs3okqi093ia8m.png"
            alt="Black Quilted Designer Purse"
            fill
            sizes="(min-width: 1024px) 32vw, 80vw"
            className="object-contain rounded-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
} 