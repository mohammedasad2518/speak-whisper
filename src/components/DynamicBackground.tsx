import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

const UNSPLASH_IMAGES: Record<string, string[]> = {
  "/home": [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80",
  ],
  "/new": [
    "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80",
    "https://images.unsplash.com/photo-1518173946687-a7c1a9408d70?w=1920&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1920&q=80",
  ],
  "/creator": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&q=80",
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80",
  ],
  "/settings": [
    "https://images.unsplash.com/photo-1500468756762-a401b6f17b46?w=1920&q=80",
    "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80",
  ],
};

const BgCtx = createContext<string>("");
export const useBgImage = () => useContext(BgCtx);

function pickRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRouteKey(pathname: string) {
  for (const key of Object.keys(UNSPLASH_IMAGES)) {
    if (key !== "default" && pathname.startsWith(key)) return key;
  }
  return "default";
}

export const DynamicBackground = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [bgUrl, setBgUrl] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const key = getRouteKey(location.pathname);
    const images = UNSPLASH_IMAGES[key] || UNSPLASH_IMAGES.default;
    const newUrl = pickRandom(images);
    setLoaded(false);
    setBgUrl(newUrl);

    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = newUrl;
  }, [location.pathname]);

  return (
    <BgCtx.Provider value={bgUrl}>
      {/* Background layer */}
      <div className="fixed inset-0 -z-10 transition-opacity duration-700" style={{ opacity: loaded ? 1 : 0 }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
        {/* Subtle overlay to ensure readability */}
        <div className="absolute inset-0 bg-white/30" />
      </div>
      {/* Fallback bg while loading */}
      <div className="fixed inset-0 -z-20 bg-secondary" />
      {children}
    </BgCtx.Provider>
  );
};
