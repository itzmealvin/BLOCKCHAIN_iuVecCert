import {Box, Flex} from "@chakra-ui/react";
import {Outlet} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DarkModeSwitch from "../components/Elements/DarkModeSwitch";
import NavBar from "../components/Elements/NavBar";

const Layout = () => {
    return (
        <>
            <NavBar/>
            <div id="main">
                <Outlet/>
                <ToastContainer
                    stacked
                    position="bottom-right"
                    autoClose={1000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable
                    pauseOnHover
                    theme="colored"
                />
                <Flex
                    justifyContent="flex-end"
                    position="fixed"
                    bottom={0}
                    right={0}
                    padding={2}
                >
                    <Box>
                        <DarkModeSwitch/>
                    </Box>
                </Flex>
            </div>
        </>
    );
};

export default Layout;
