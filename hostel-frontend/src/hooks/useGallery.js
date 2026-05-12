import { useEffect, useState } from "react";
import { sampleGallery } from "../lib/siteData";
import { hasSupabaseEnv, requireSupabase } from "../lib/supabase";

export default function useGallery() {
  const [galleryItems, setGalleryItems] = useState(sampleGallery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFallback, setIsFallback] = useState(!hasSupabaseEnv);

  useEffect(() => {
    let active = true;

    async function loadGallery() {
      if (!hasSupabaseEnv) {
        setLoading(false);
        return;
      }

      try {
        const supabase = await requireSupabase();
        const { data, error: fetchError } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (!active) {
          return;
        }

        if (data?.length) {
          setGalleryItems(data);
          setIsFallback(false);
        } else {
          setGalleryItems(sampleGallery);
          setIsFallback(true);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        setGalleryItems(sampleGallery);
        setIsFallback(true);
        setError(loadError.message || "Unable to load gallery from Supabase.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      active = false;
    };
  }, []);

  return {
    galleryItems,
    loading,
    error,
    isFallback,
  };
}
