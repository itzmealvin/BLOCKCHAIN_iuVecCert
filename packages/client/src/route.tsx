import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage.tsx";
import LandingPage from "./pages/LandingPage.tsx";

import RouteChangeHandler from "./components/RouteChangeHandler.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import DocsPage from "./pages/DocsPage.tsx";
import Layout from "./pages/Layout.tsx";
import Maintenance from "./pages/Maintenance.tsx";
import RevokePage from "./pages/RevokePage.tsx";
import SelectivePage from "./pages/SelectivePage.tsx";
import VerifierPage from "./pages/VerifyPage.tsx";

interface Tab {
  path: string;
  element: React.ReactElement;
  name: string;
}

export const tabs = [
  { path: "verifier", element: <VerifierPage />, name: "Verify" },
  { path: "revoke", element: <RevokePage />, name: "Revoke" },
  import.meta.env.VITE_ENABLE_SELECTIVE === "true" && {
    path: "selective",
    element: <SelectivePage />,
    name: "Selective Disclosure",
  },
  {
    path: "docs",
    element: <DocsPage />,
    name: "Docs",
  },
  {
    path: "about",
    element: <AboutPage />,
    name: "About",
  },
  {
    path: "contact",
    element: <ContactPage />,
    name: "Contact",
  },
].filter(Boolean) as Tab[];

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <RouteChangeHandler />
        {import.meta.env.VITE_ENABLE_MAINTENANCE === "true"
          ? <Maintenance />
          : <Layout />}
      </>
    ),
    errorElement: <ErrorPage />,
    children: [{ index: true, element: <LandingPage /> }, ...tabs],
  },
]);

export default router;
