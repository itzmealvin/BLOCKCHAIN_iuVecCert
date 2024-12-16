import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useFileStore from "../hooks/useFileStore.ts";

const RouteChangeHandler = () => {
  const location = useLocation();
  const { resetFile } = useFileStore();

  useEffect(() => {
    resetFile();
  }, [location, resetFile]);

  return null;
};

export default RouteChangeHandler;
