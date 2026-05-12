import GalleryGrid from "../components/GalleryGrid";
import useGallery from "../hooks/useGallery";

export default function Gallery() {
  const { galleryItems, loading, error, isFallback } = useGallery();

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__content">
          <p className="eyebrow">Gallery</p>
          <h1>See the rooms, common spaces, and moments that shape the stay.</h1>
          <p>
            Browse room details, social spaces, event snapshots, and food moments. Images can be
            powered directly from Supabase Storage.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error ? <p className="inline-message">{error}</p> : null}
          {isFallback ? <p className="inline-message">Showing sample gallery content until Supabase Storage is connected.</p> : null}
          <GalleryGrid items={galleryItems} loading={loading} />
        </div>
      </section>
    </>
  );
}
