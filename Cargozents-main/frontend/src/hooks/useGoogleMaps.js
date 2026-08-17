import { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        setLoaded(true);
      })
      .catch(console.error);
  }, []);

  return loaded;
}