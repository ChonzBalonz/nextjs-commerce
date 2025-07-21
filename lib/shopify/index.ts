import {
    HIDDEN_PRODUCT_TAG
} from 'lib/constants';
import { isShopifyError } from 'lib/type-guards';
import {
    Cart,
    Collection,
    Connection,
    Image,
    Menu,
    Page,
    Product,
    ShopifyCart,
    ShopifyCollection,
    ShopifyProduct
} from './types';

// Replace environment variables with static placeholders for portfolio display
const domain = 'https://placeholder-domain.com';
const endpoint = `${domain}/api/graphql`;
const key = 'placeholder-access-token';

type ExtractVariables<T> = T extends { variables: object }
  ? T['variables']
  : never;

export async function shopifyFetch<T>({
  headers,
  query,
  variables
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key,
        ...headers
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      })
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || 'unknown',
        status: e.status || 500,
        message: e.message,
        query
      };
    }

    throw {
      error: e,
      query
    };
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: cart.cost.totalAmount.currencyCode
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};

const reshapeCollection = (
  collection: ShopifyCollection
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants)
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

// --- PLACEHOLDER DATA FOR DESIGNER CLOTHES DEMO ---
const placeholderCollections = [
  {
    handle: 'mens-designer',
    title: "Men's Designer",
    description: 'Premium menswear from top designers.',
    seo: { title: "Men's Designer", description: 'Premium menswear from top designers.' },
    updatedAt: new Date().toISOString(),
    path: '/search/mens-designer'
  },
  {
    handle: 'womens-designer',
    title: "Women's Designer",
    description: 'Luxury womenswear from world-renowned brands.',
    seo: { title: "Women's Designer", description: 'Luxury womenswear from world-renowned brands.' },
    updatedAt: new Date().toISOString(),
    path: '/search/womens-designer'
  }
];

const placeholderProducts = [
  {
    id: 'prod-1',
    handle: 'gucci-jacket',
    availableForSale: true,
    title: 'Gucci Wool Jacket',
    description: 'A luxury wool jacket from Gucci.',
    descriptionHtml: '<p>A luxury wool jacket from Gucci. 100% wool, made in Italy.</p>',
    options: [
      { id: 'opt-1', name: 'Size', values: ['S', 'M', 'L', 'XL'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '2200', currencyCode: 'USD' },
      minVariantPrice: { amount: '2200', currencyCode: 'USD' }
    },
    variants: [
      {
        id: 'var-1',
        title: 'S',
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: 'S' }],
        price: { amount: '2200', currencyCode: 'USD' }
      },
      {
        id: 'var-2',
        title: 'M',
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: 'M' }],
        price: { amount: '2200', currencyCode: 'USD' }
      },
      {
        id: 'var-3',
        title: 'L',
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: 'L' }],
        price: { amount: '2200', currencyCode: 'USD' }
      },
      {
        id: 'var-4',
        title: 'XL',
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: 'XL' }],
        price: { amount: '2200', currencyCode: 'USD' }
      }
    ],
    featuredImage: {
      url: 'https://img.vitkac.com/uploads/product_thumb/KURTKA%20762162%20ZAPKE-2190/lg/1.png',
      altText: 'Gucci Wool Jacket',
      width: 600,
      height: 800
    },
    images: [
      { url: 'https://img.vitkac.com/uploads/product_thumb/KURTKA%20762162%20ZAPKE-2190/lg/1.png', altText: 'Gucci Wool Jacket', width: 600, height: 800 }
    ],
    seo: { title: 'Gucci Wool Jacket', description: 'A luxury wool jacket from Gucci.' },
    tags: ['designer', 'gucci', 'jacket'],
    updatedAt: new Date().toISOString(),
    gender: 'men'
  },
  {
    id: 'prod-2',
    handle: 'prada-dress',
    availableForSale: true,
    title: 'Prada Silk Dress',
    description: 'Elegant silk dress by Prada.',
    descriptionHtml: '<p>Elegant silk dress by Prada. Flowy, comfortable, and stylish.</p>',
    options: [
      { id: 'opt-2', name: 'Size', values: ['XS', 'S', 'M', 'L'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '1800', currencyCode: 'USD' },
      minVariantPrice: { amount: '1800', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-5', title: 'XS', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'XS' }], price: { amount: '1800', currencyCode: 'USD' } },
      { id: 'var-6', title: 'S', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }], price: { amount: '1800', currencyCode: 'USD' } },
      { id: 'var-7', title: 'M', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'M' }], price: { amount: '1800', currencyCode: 'USD' } },
      { id: 'var-8', title: 'L', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }], price: { amount: '1800', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://th.bing.com/th/id/R.cd5ccd569a71df940dba91d51e5db141?rik=4k%2f%2fwlMaj%2fpW2A&pid=ImgRaw&r=0',
      altText: 'Prada Silk Dress',
      width: 600,
      height: 800
    },
    images: [
      { url: 'https://th.bing.com/th/id/R.cd5ccd569a71df940dba91d51e5db141?rik=4k%2f%2fwlMaj%2fpW2A&pid=ImgRaw&r=0', altText: 'Prada Silk Dress', width: 600, height: 800 }
    ],
    seo: { title: 'Prada Silk Dress', description: 'Elegant silk dress by Prada.' },
    tags: ['designer', 'prada', 'dress'],
    updatedAt: new Date().toISOString(),
    gender: 'women'
  },
  {
    id: 'prod-3',
    handle: 'balenciaga-sneakers',
    availableForSale: true,
    title: 'Balenciaga Triple S Sneakers',
    description: 'Iconic chunky sneakers from Balenciaga.',
    descriptionHtml: '<p>Iconic chunky sneakers from Balenciaga. Street style essential.</p>',
    options: [
      { id: 'opt-3', name: 'Size', values: ['7', '8', '9', '10', '11'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '950', currencyCode: 'USD' },
      minVariantPrice: { amount: '950', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-9', title: '7', availableForSale: true, selectedOptions: [{ name: 'Size', value: '7' }], price: { amount: '950', currencyCode: 'USD' } },
      { id: 'var-10', title: '8', availableForSale: true, selectedOptions: [{ name: 'Size', value: '8' }], price: { amount: '950', currencyCode: 'USD' } },
      { id: 'var-11', title: '9', availableForSale: true, selectedOptions: [{ name: 'Size', value: '9' }], price: { amount: '950', currencyCode: 'USD' } },
      { id: 'var-12', title: '10', availableForSale: true, selectedOptions: [{ name: 'Size', value: '10' }], price: { amount: '950', currencyCode: 'USD' } },
      { id: 'var-13', title: '11', availableForSale: true, selectedOptions: [{ name: 'Size', value: '11' }], price: { amount: '950', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://image.goat.com/crop/750/attachments/product_template_pictures/images/008/832/833/original/483547W06E11000.png',
      altText: 'Balenciaga Triple S Sneakers',
      width: 750,
      height: 750
    },
    images: [
      { url: 'https://image.goat.com/crop/750/attachments/product_template_pictures/images/008/832/833/original/483547W06E11000.png', altText: 'Balenciaga Triple S Sneakers', width: 750, height: 750 }
    ],
    seo: { title: 'Balenciaga Triple S Sneakers', description: 'Iconic chunky sneakers from Balenciaga.' },
    tags: ['designer', 'balenciaga', 'sneakers'],
    updatedAt: new Date().toISOString(),
    gender: 'men'
  },
  // New designer products for men and women
  {
    id: 'prod-4',
    handle: 'versace-men-shirt',
    availableForSale: true,
    title: 'Versace Baroque Print Shirt',
    description: 'A bold, iconic men\'s shirt with Versace\'s signature baroque print.',
    descriptionHtml: '<p>A bold, iconic men\'s shirt with Versace\'s signature baroque print. 100% silk, made in Italy.</p>',
    options: [
      { id: 'opt-4', name: 'Size', values: ['S', 'M', 'L', 'XL'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '950', currencyCode: 'USD' },
      minVariantPrice: { amount: '950', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-14', title: 'S', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }], price: { amount: '950', currencyCode: 'USD' } },
      { id: 'var-15', title: 'M', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'M' }], price: { amount: '950', currencyCode: 'USD' } },
      { id: 'var-16', title: 'L', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }], price: { amount: '950', currencyCode: 'USD' } },
      { id: 'var-17', title: 'XL', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'XL' }], price: { amount: '950', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://cdn.whatsonthestar.com/uploads/1666813707397.png',
      altText: 'Versace Baroque Print Shirt',
      width: 600,
      height: 800
    },
    images: [
      { url: 'https://cdn.whatsonthestar.com/uploads/1666813707397.png', altText: 'Versace Baroque Print Shirt', width: 600, height: 800 }
    ],
    seo: { title: 'Versace Baroque Print Shirt', description: 'A bold, iconic men\'s shirt with Versace\'s signature baroque print.' },
    tags: ['designer', 'versace', 'shirt', 'men'],
    updatedAt: new Date().toISOString(),
    gender: 'men'
  },
  {
    id: 'prod-5',
    handle: 'dior-women-skirt',
    availableForSale: true,
    title: 'Dior Pleated Midi Skirt',
    description: 'A graceful pleated midi skirt for women by Dior.',
    descriptionHtml: '<p>A graceful pleated midi skirt for women by Dior. Lightweight and elegant, perfect for any occasion.</p>',
    options: [
      { id: 'opt-5', name: 'Size', values: ['XS', 'S', 'M', 'L'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '1200', currencyCode: 'USD' },
      minVariantPrice: { amount: '1200', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-18', title: 'XS', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'XS' }], price: { amount: '1200', currencyCode: 'USD' } },
      { id: 'var-19', title: 'S', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }], price: { amount: '1200', currencyCode: 'USD' } },
      { id: 'var-20', title: 'M', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'M' }], price: { amount: '1200', currencyCode: 'USD' } },
      { id: 'var-21', title: 'L', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }], price: { amount: '1200', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://api-prod.thatconceptstore.com/medias/-original-1110727-PHIL-A0002-3.png-convert-960x1280?context=bWFzdGVyfGF6dXJlaW1hZ2VzfDQ5MTk4MHxpbWFnZS9wbmd8YURNNUwyZzVaQzg1TmpBMk5ERTJORFkxT1RVd0x5OXZjbWxuYVc1aGJDOHhNVEV3TnpJM1gxQklTVXhmUVRBd01ESmZNeTV3Ym1kZlkyOXVkbVZ5ZEMwNU5qQjRNVEk0TUF8OTgwOGZiNjQzNjY5NjU1ZThlMGQ3M2ZjMjk3NjcxM2FiMjUyOGFkN2NkNjAzMzdmODA2NTBmMzFjNjYxNjMxZg',
      altText: 'Dior Pleated Midi Skirt',
      width: 960,
      height: 1280
    },
    images: [
      { url: 'https://api-prod.thatconceptstore.com/medias/-original-1110727-PHIL-A0002-3.png-convert-960x1280?context=bWFzdGVyfGF6dXJlaW1hZ2VzfDQ5MTk4MHxpbWFnZS9wbmd8YURNNUwyZzVaQzg1TmpBMk5ERTJORFkxT1RVd0x5OXZjbWxuYVc1aGJDOHhNVEV3TnpJM1gxQklTVXhmUVRBd01ESmZNeTV3Ym1kZlkyOXVkbVZ5ZEMwNU5qQjRNVEk0TUF8OTgwOGZiNjQzNjY5NjU1ZThlMGQ3M2ZjMjk3NjcxM2FiMjUyOGFkN2NkNjAzMzdmODA2NTBmMzFjNjYxNjMxZg', altText: 'Dior Pleated Midi Skirt', width: 960, height: 1280 }
    ],
    seo: { title: 'Dior Pleated Midi Skirt', description: 'A graceful pleated midi skirt for women by Dior.' },
    tags: ['designer', 'dior', 'skirt', 'women'],
    updatedAt: new Date().toISOString(),
    gender: 'women'
  },
  {
    id: 'prod-6',
    handle: 'saintlaurent-men-shoes',
    availableForSale: true,
    title: 'Saint Laurent Leather Loafers',
    description: 'Classic men\'s leather loafers by Saint Laurent.',
    descriptionHtml: '<p>Classic men\'s leather loafers by Saint Laurent. Handcrafted in Italy for timeless style.</p>',
    options: [
      { id: 'opt-6', name: 'Size', values: ['8', '9', '10', '11', '12'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '890', currencyCode: 'USD' },
      minVariantPrice: { amount: '890', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-22', title: '8', availableForSale: true, selectedOptions: [{ name: 'Size', value: '8' }], price: { amount: '890', currencyCode: 'USD' } },
      { id: 'var-23', title: '9', availableForSale: true, selectedOptions: [{ name: 'Size', value: '9' }], price: { amount: '890', currencyCode: 'USD' } },
      { id: 'var-24', title: '10', availableForSale: true, selectedOptions: [{ name: 'Size', value: '10' }], price: { amount: '890', currencyCode: 'USD' } },
      { id: 'var-25', title: '11', availableForSale: true, selectedOptions: [{ name: 'Size', value: '11' }], price: { amount: '890', currencyCode: 'USD' } },
      { id: 'var-26', title: '12', availableForSale: true, selectedOptions: [{ name: 'Size', value: '12' }], price: { amount: '890', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://img.vitkac.com/uploads/product_thumb/BUTY%20670231%2018RTT-1906/lg/6.png',
      altText: 'Saint Laurent Leather Loafers',
      width: 600,
      height: 800
    },
    images: [
      { url: 'https://img.vitkac.com/uploads/product_thumb/BUTY%20670231%2018RTT-1906/lg/6.png', altText: 'Saint Laurent Leather Loafers', width: 600, height: 800 }
    ],
    seo: { title: 'Saint Laurent Leather Loafers', description: 'Classic men\'s leather loafers by Saint Laurent.' },
    tags: ['designer', 'saintlaurent', 'loafers', 'men'],
    updatedAt: new Date().toISOString(),
    gender: 'men'
  },
  {
    id: 'prod-7',
    handle: 'chanel-women-blouse',
    availableForSale: true,
    title: 'Chanel Silk Blouse',
    description: 'Elegant silk blouse for women by Chanel.',
    descriptionHtml: '<p>Elegant silk blouse for women by Chanel. Soft, luxurious, and perfect for any occasion.</p>',
    options: [
      { id: 'opt-7', name: 'Size', values: ['XS', 'S', 'M', 'L'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '1350', currencyCode: 'USD' },
      minVariantPrice: { amount: '1350', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-27', title: 'XS', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'XS' }], price: { amount: '1350', currencyCode: 'USD' } },
      { id: 'var-28', title: 'S', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }], price: { amount: '1350', currencyCode: 'USD' } },
      { id: 'var-29', title: 'M', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'M' }], price: { amount: '1350', currencyCode: 'USD' } },
      { id: 'var-30', title: 'L', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }], price: { amount: '1350', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://i.pinimg.com/originals/47/74/51/477451f44896fccc4083cc4bb424afa5.png',
      altText: 'Chanel Silk Blouse',
      width: 600,
      height: 800
    },
    images: [
      { url: 'https://i.pinimg.com/originals/47/74/51/477451f44896fccc4083cc4bb424afa5.png', altText: 'Chanel Silk Blouse', width: 600, height: 800 }
    ],
    seo: { title: 'Chanel Silk Blouse', description: 'Elegant silk blouse for women by Chanel.' },
    tags: ['designer', 'chanel', 'blouse', 'women'],
    updatedAt: new Date().toISOString(),
    gender: 'women'
  },
  {
    id: 'prod-8',
    handle: 'fendi-men-tshirt',
    availableForSale: true,
    title: 'Fendi Logo T-Shirt',
    description: 'Men\'s cotton t-shirt with Fendi logo.',
    descriptionHtml: '<p>Men\'s cotton t-shirt with Fendi logo. Comfortable and stylish for everyday wear.</p>',
    options: [
      { id: 'opt-8', name: 'Size', values: ['S', 'M', 'L', 'XL'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '490', currencyCode: 'USD' },
      minVariantPrice: { amount: '490', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-31', title: 'S', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }], price: { amount: '490', currencyCode: 'USD' } },
      { id: 'var-32', title: 'M', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'M' }], price: { amount: '490', currencyCode: 'USD' } },
      { id: 'var-33', title: 'L', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }], price: { amount: '490', currencyCode: 'USD' } },
      { id: 'var-34', title: 'XL', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'XL' }], price: { amount: '490', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://cnfanssheet.s3.ap-southeast-1.amazonaws.com/goods/Fendi_T_shirt_Black_T_shirt_T_Shirts_7266005563_1.png',
      altText: 'Fendi Logo T-Shirt',
      width: 600,
      height: 800
    },
    images: [
      { url: 'https://cnfanssheet.s3.ap-southeast-1.amazonaws.com/goods/Fendi_T_shirt_Black_T_shirt_T_Shirts_7266005563_1.png', altText: 'Fendi Logo T-Shirt', width: 600, height: 800 }
    ],
    seo: { title: 'Fendi Logo T-Shirt', description: 'Men\'s cotton t-shirt with Fendi logo.' },
    tags: ['designer', 'fendi', 'tshirt', 'men'],
    updatedAt: new Date().toISOString(),
    gender: 'men'
  },
  {
    id: 'prod-9',
    handle: 'jimmychoo-women-heels',
    availableForSale: true,
    title: 'Jimmy Choo Crystal Heels',
    description: 'Stunning crystal-embellished heels for women by Jimmy Choo.',
    descriptionHtml: '<p>Stunning crystal-embellished heels for women by Jimmy Choo. Perfect for special occasions.</p>',
    options: [
      { id: 'opt-9', name: 'Size', values: ['6', '7', '8', '9', '10'] }
    ],
    priceRange: {
      maxVariantPrice: { amount: '1200', currencyCode: 'USD' },
      minVariantPrice: { amount: '1200', currencyCode: 'USD' }
    },
    variants: [
      { id: 'var-35', title: '6', availableForSale: true, selectedOptions: [{ name: 'Size', value: '6' }], price: { amount: '1200', currencyCode: 'USD' } },
      { id: 'var-36', title: '7', availableForSale: true, selectedOptions: [{ name: 'Size', value: '7' }], price: { amount: '1200', currencyCode: 'USD' } },
      { id: 'var-37', title: '8', availableForSale: true, selectedOptions: [{ name: 'Size', value: '8' }], price: { amount: '1200', currencyCode: 'USD' } },
      { id: 'var-38', title: '9', availableForSale: true, selectedOptions: [{ name: 'Size', value: '9' }], price: { amount: '1200', currencyCode: 'USD' } },
      { id: 'var-39', title: '10', availableForSale: true, selectedOptions: [{ name: 'Size', value: '10' }], price: { amount: '1200', currencyCode: 'USD' } }
    ],
    featuredImage: {
      url: 'https://i.pinimg.com/originals/37/63/07/376307d0257678ba8d310ea07462703f.png',
      altText: 'Jimmy Choo Crystal Heels',
      width: 600,
      height: 800
    },
    images: [
      { url: 'https://i.pinimg.com/originals/37/63/07/376307d0257678ba8d310ea07462703f.png', altText: 'Jimmy Choo Crystal Heels', width: 600, height: 800 }
    ],
    seo: { title: 'Jimmy Choo Crystal Heels', description: 'Stunning crystal-embellished heels for women by Jimmy Choo.' },
    tags: ['designer', 'jimmychoo', 'heels', 'women'],
    updatedAt: new Date().toISOString(),
    gender: 'women'
  }
];
// --- END PLACEHOLDER DATA ---

export async function createCart(): Promise<Cart> {
  // Placeholder logic for portfolio
  return {} as Cart;
}

export async function addToCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  // Placeholder logic for portfolio
  return {} as Cart;
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  // Placeholder logic for portfolio
  return {} as Cart;
}

export async function updateCart(lines: { id: string; merchandiseId: string; quantity: number }[]): Promise<Cart> {
  // Placeholder logic for portfolio
  return {} as Cart;
}

export async function getCart(): Promise<Cart> {
  return {
    id: 'demo-cart',
    checkoutUrl: '',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  return placeholderCollections.find((c) => c.handle === handle);
}

export async function getCollectionProducts({ collection }: { collection: string }): Promise<Product[]> {
  if (collection === 'mens-designer') {
    return placeholderProducts.filter((p) => p.gender === 'men');
  }
  if (collection === 'womens-designer') {
    return placeholderProducts.filter((p) => p.gender === 'women');
  }
  // For other collections, return all products
  return placeholderProducts;
}

export async function getCollections(): Promise<Collection[]> {
  return placeholderCollections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  // Placeholder logic for portfolio
  return [];
}

export async function getPage(handle: string): Promise<Page> {
  // Placeholder logic for portfolio
  return {} as Page;
}

export async function getPages(): Promise<Page[]> {
  // Placeholder logic for portfolio
  return [];
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  return placeholderProducts.find((p) => p.handle === handle);
}

export async function getProductRecommendations(): Promise<Product[]> {
  // For demo, return all products except the first
  return placeholderProducts.slice(1);
}

export async function getProducts(): Promise<Product[]> {
  return placeholderProducts;
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: any): Promise<any> {
  // Placeholder: No backend functionality for portfolio display
  return { status: 200, message: 'This is a placeholder. No backend functionality.' };
}
