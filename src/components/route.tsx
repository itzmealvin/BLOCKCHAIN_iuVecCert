import { createBrowserRouter } from "react-router-dom";
import IssuerPage from "./Issuer/IssuerPage";
import ErrorPage from "./Pages/ErrorPage";
import LandingPage from "./Pages/LandingPage";
import Layout from "./Pages/Layout";
import RevokeCerts from "./RevokeCerts";
import VerifierPage from "./Verifier/VerifierPage";

export const tabs = [
  {
    path: "issuer",
    element: <IssuerPage />,
    name: "For Issuer",
  },
  { path: "verifier", element: <VerifierPage />, name: "For Verifiers" },
  { path: "revoke", element: <RevokeCerts />, name: "Revoke Certificate" },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      ...tabs.map((tab) => {
        return { path: tab.path, element: tab.element };
      }),
    ],
  },
]);

export default router;
