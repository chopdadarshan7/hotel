import { useEffect, useState } from "react";
import { hasFirebaseEnv } from "../firebase/config";
import { getGallery as getFirebaseGallery } from "../firebase/services";
import { sampleGallery } from "../lib/siteData";

export default function useGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFallback, setIsFallback] = useState(!hasFirebaseEnv);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hasFirebaseEnv) {
        if (active) {
          setItems(sampleGallery);
          setIsFallback(true);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getFirebaseGallery();
        if (!active) return;
        setItems(data.length ? data : sampleGallery);
        setIsFallback(!data.length);
      } catch (err) {
        if (!active) return;
        setItems(sampleGallery);
        setIsFallback(true);
        setError(err.message || "Unable to load gallery.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  return { items, loading, error, isFallback };
}
