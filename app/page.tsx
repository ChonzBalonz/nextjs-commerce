import { ThreeItemGrid } from 'components/grid/three-items';
import Footer from 'components/layout/footer';
import Hero from '../components/hero';
import ReactSlickCarousel from '../components/react-slick-carousel';

export const metadata = {
  description:
    'High-performance ecommerce store built with Next.js, Vercel, and Shopify.',
  openGraph: {
    type: 'website'
  }
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="products-section" className="my-8 md:my-12 px-2 md:px-0">
        <ThreeItemGrid />
      </div>
      <Footer />
      <div className="my-8 md:my-12">
        <ReactSlickCarousel />
      </div>
    </>
  );
}
