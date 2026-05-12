import { useEffect, useState } from "react";
import { sampleRooms } from "../lib/siteData";
import { hasSupabaseEnv, requireSupabase } from "../lib/supabase";

export default function useRooms() {
  const [rooms, setRooms] = useState(sampleRooms);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFallback, setIsFallback] = useState(!hasSupabaseEnv);

  useEffect(() => {
    let active = true;

    async function loadRooms() {
      if (!hasSupabaseEnv) {
        setLoading(false);
        return;
      }

      try {
        const supabase = await requireSupabase();
        const { data, error: fetchError } = await supabase
          .from("rooms")
          .select("*")
          .order("price_per_night", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (!active) {
          return;
        }

        if (data?.length) {
          setRooms(data);
          setIsFallback(false);
        } else {
          setRooms(sampleRooms);
          setIsFallback(true);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        setRooms(sampleRooms);
        setIsFallback(true);
        setError(loadError.message || "Unable to load rooms from Supabase.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRooms();

    return () => {
      active = false;
    };
  }, []);

  return {
    rooms,
    loading,
    error,
    isFallback,
  };
}
