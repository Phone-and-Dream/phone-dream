import chain from "./chain.utils";
import { PRIVATE_KEY } from "./env.utils";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, parseAbi, http, type WalletClient } from "viem";

let walletClient: WalletClient | undefined = undefined;

const account = privateKeyToAccount(PRIVATE_KEY);

const getWalletClient = () => {
  if (!walletClient) {
    walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    });
  }

  return walletClient;
};

export const performOnchainAction = async ({ action }: { action: string }) => {
  const walletClient = getWalletClient();
  switch (action) {
    case "allow-badge-mint": 
      await walletClient.writeContract({
        address: "0x",
        abi: parseAbi(["function allowBadgeMint(string memory userId)"]),
        functionName: "allowBadgeMint",
        args: ["userId"],
        account,
        chain
      }); 
      return
    default:
      return
  }
}
