'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { GridTileImage } from 'components/grid/tile';
import { useProduct, useUpdateURL } from 'components/product/product-context';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export function Gallery({ images }: { images: { src: string; altText: string }[] }) {
  const { state, updateImage } = useProduct();
  const updateURL = useUpdateURL();
  const imageIndex = state.image ? parseInt(state.image) : 0;

  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;
  const previousImageIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;

  const buttonClassName =
    'h-full px-6 transition-all ease-in-out hover:scale-110 hover:text-black dark:hover:text-white flex items-center justify-center';

  // Ref for the thumbnail list
  const thumbListRef = useRef<HTMLUListElement>(null);

  // Smooth, infinite auto-scroll for the thumbnail list
  useEffect(() => {
    const ul = thumbListRef.current;
    if (!ul || images.length <= 1) return;
    let frameId: number;
    const scrollSpeed = 0.5; // px per frame, adjust for speed
    function animate() {
      if (!ul) return;
      ul.scrollLeft += scrollSpeed;
      // If we've reached the end, reset to the start for infinite loop
      if (ul.scrollLeft >= ul.scrollWidth / 2) {
        ul.scrollLeft = 0;
      }
      frameId = requestAnimationFrame(animate);
    }
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [images.length]);

  // Duplicate images for seamless infinite scroll
  const infiniteImages = [...images, ...images];

  return (
    <form>
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        {images[imageIndex] && (
          <Image
            className="h-full w-full object-contain"
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt={images[imageIndex]?.altText as string}
            src={images[imageIndex]?.src as string}
            priority={true}
          />
        )}

        {images.length > 1 ? (
          <div className="absolute bottom-[15%] flex w-full justify-center">
            <div className="mx-auto flex h-11 items-center rounded-full border border-white bg-neutral-50/80 text-neutral-500 backdrop-blur-sm dark:border-black dark:bg-neutral-900/80">
              <button
                formAction={() => {
                  const newState = updateImage(previousImageIndex.toString());
                  updateURL(newState);
                }}
                aria-label="Previous product image"
                className={buttonClassName}
              >
                <ArrowLeftIcon className="h-5" />
              </button>
              <div className="mx-1 h-6 w-px bg-neutral-500"></div>
              <button
                formAction={() => {
                  const newState = updateImage(nextImageIndex.toString());
                  updateURL(newState);
                }}
                aria-label="Next product image"
                className={buttonClassName}
              >
                <ArrowRightIcon className="h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul ref={thumbListRef} className="my-12 flex items-center flex-nowrap gap-2 overflow-x-auto py-1 lg:mb-0 scrollbar-hide" style={{scrollBehavior: 'smooth', minWidth: '100%'}}>
          {infiniteImages.map((image, index) => {
            const isActive = index % images.length === imageIndex;
            return (
              <li key={image.src + '-' + index} className="h-20 w-20 flex-shrink-0">
                <button
                  formAction={() => {
                    const newState = updateImage((index % images.length).toString());
                    updateURL(newState);
                  }}
                  aria-label="Select product image"
                  className="h-full w-full"
                >
                  <GridTileImage
                    alt={image.altText}
                    src={image.src}
                    width={80}
                    height={80}
                    active={isActive}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </form>
  );
}
