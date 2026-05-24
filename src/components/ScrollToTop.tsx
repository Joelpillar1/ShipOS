import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force the window to scroll to top whenever the pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use "instant" to ensure it's at the top before the user sees the page
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
