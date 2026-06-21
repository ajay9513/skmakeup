/** Cloudinary-compatible image object for database seeding (uses demo/sample asset). */
export function seedPlaceholderImage(folder: string, alt: string, cloudName?: string) {
  const cloud = cloudName || 'dgxz36qfa';
  const asset = 'sample';
  const base = `https://res.cloudinary.com/${cloud}/image/upload/c_fill,w_1200,h_800,q_auto,f_auto/${asset}`;
  return {
    publicId: `${folder}/${asset}`,
    secureUrl: base,
    url: base,
    width: 1200,
    height: 800,
    format: 'jpg',
    bytes: 0,
    alt,
    folder,
    order: 0,
    isFeatured: true,
  };
}
