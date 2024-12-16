import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useMemo } from "react";
import { Account, Chain, Client, Transport } from "viem";
import { Config, useConnectorClient } from "wagmi";

/**
 * Convert Viem client to Ethers signer
 * @param client The Viem client to be converted
 */
const clientToSigner = (
  client: Client<Transport, Chain, Account>,
): JsonRpcSigner => {
  const { account, chain, transport } = client;
  const provider = new BrowserProvider(transport, {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  });
  return new JsonRpcSigner(provider, account.address);
};

/**
 * Hook to be used to get Ethers signer
 * @param chainId The chainId to connect the signer to
 */
export const useEthersSigner = ({ chainId }: { chainId?: number } = {}) => {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
};
