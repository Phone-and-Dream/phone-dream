// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { type Address } from "viem";

const FEE_RECIPIENT: Address = "0x";
const AUTHROIZED_ADDRESS: Address = "0x";

const ImpactSBTModule = buildModule("ImpactSBTModule", (deploymentModule) => {

  const impactSBT = deploymentModule.contract("ImpactSBT", [FEE_RECIPIENT, AUTHROIZED_ADDRESS]);

  return { impactSBT };
});

export default ImpactSBTModule;
