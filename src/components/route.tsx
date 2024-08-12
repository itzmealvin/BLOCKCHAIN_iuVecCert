import {createBrowserRouter} from "react-router-dom";
import IssuerPage from "../pages/IssuerPage";
import ErrorPage from "../pages/ErrorPage";
import LandingPage from "../pages/LandingPage";
import Layout from "../pages/Layout";
import RevokeCerts from "../pages/RevokeCerts";
import VerifierPage from "../pages/VerifierPage";

export const tabs = [
    {
        path: "issuer",
        element: <IssuerPage/>,
        name: "For Issuer",
    },
    {path: "verifier", element: <VerifierPage/>, name: "For Verifiers"},
    {path: "revoke", element: <RevokeCerts/>, name: "Revoke Certificate"},
];

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        errorElement: <ErrorPage/>,
        children: [
            {index: true, element: <LandingPage/>},
            ...tabs.map((tab) => {
                return {path: tab.path, element: tab.element};
            }),
        ],
    },
]);

export default router;
