"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { getProducts } from "../lib/shopify";
import Price from "./price";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

const settings = {
  dots: true,
  infinite: true,
  speed: 700,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 1200,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};

export default function ReactSlickCarousel() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  if (!products.length) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-2">
      <Slider {...settings}>
        {products.map((product, i) => (
          <Link key={product.id} href={`/product/${product.handle}`} className="flex flex-col items-center justify-center p-4 cursor-pointer">
            <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center relative" style={{height: 320, width: 320}}>
              <Image
                src={product.featuredImage?.url}
                alt={product.title}
                width={product.featuredImage?.width || 320}
                height={product.featuredImage?.height || 320}
                className="object-contain w-full h-full"
                priority={i < 3}
              />
            </div>
            <div className="mt-4 text-center text-white font-semibold text-lg">{product.title}</div>
            <div className="mt-2">
              <Price amount={product.priceRange.maxVariantPrice.amount} currencyCode={product.priceRange.maxVariantPrice.currencyCode} />
            </div>
          </Link>
        ))}
      </Slider>
    </div>
  );
} 