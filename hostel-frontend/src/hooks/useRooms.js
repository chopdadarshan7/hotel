import { useEffect, useState } from "react";
import { hasFirebaseEnv } from "../firebase/config";
import { getRooms as getFirebaseRooms } from "../firebase/services";
import { sampleRooms } from "../lib/siteData";

export default function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFallback, setIsFallback] = useState(!hasFirebaseEnv);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hasFirebaseEnv) {
        if (active) {
          setRooms(sampleRooms);
          setIsFallback(true);
          setLoading(false);
        }
        return;
      }

      try {
        const data = await getFirebaseRooms();
        if (!active) return;
        setRooms(data.length ? data : sampleRooms);
        setIsFallback(!data.length);
      } catch (err) {
        if (!active) return;
        setRooms(sampleRooms);
        setIsFallback(true);
        setError(err.message || "Unable to load rooms.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  return { rooms, loading, error, isFallback };
}
