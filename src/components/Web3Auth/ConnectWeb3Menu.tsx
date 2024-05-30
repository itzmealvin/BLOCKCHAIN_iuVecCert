import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BrowserProvider } from "ethers";
import { FaWallet } from "react-icons/fa6";
import truncateEthAddress from "truncate-eth-address";
import BlockchainServices from "../../services/BlockchainServices";
import useWeb3AuthStore from "./useWeb3AuthStore";

const ConnectWeb3Menu = () => {
  const {
    connectedAddress,
    isSignedIn,
    setDeployer,
    setConnectedAddress,
    signIn,
    logOut,
  } = useWeb3AuthStore();
  const browserWallet = BlockchainServices.getProvider() as BrowserProvider;

  const onClick = async () => {
    if (browserWallet && !isSignedIn) {
      if (!(await BlockchainServices.isOnRightNetwork(browserWallet))) {
        await BlockchainServices.switchNetwork(browserWallet);
      }
      const { signer, address } = await BlockchainServices.performSignIn(
        browserWallet
      );
      setDeployer(signer);
      setConnectedAddress(address);
      signIn();
    }
  };

  return (
    <Menu>
      <MenuButton as={Button} onClick={onClick} borderRadius={20}>
        {isSignedIn && connectedAddress ? (
          <>{truncateEthAddress(connectedAddress)}</>
        ) : (
          <span style={{ display: "flex", alignItems: "center" }}>
            Connect Wallet <FaWallet style={{ marginLeft: "5px" }} />
          </span>
        )}
      </MenuButton>
      {isSignedIn && connectedAddress ? (
        <MenuList>
          <MenuItem onClick={logOut}>Log Out</MenuItem>
        </MenuList>
      ) : null}
    </Menu>
  );
};

export default ConnectWeb3Menu;
