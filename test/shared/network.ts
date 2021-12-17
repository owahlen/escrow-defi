import hre from "hardhat";
import { Contract } from "ethers";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";

const LOCAL_CHAINS = ["hardhat", "localhost"];

export function isLocalChain(): boolean {
  const networkName = hre.network.name;
  return LOCAL_CHAINS.includes(networkName);
}

export async function verifyOnEtherscan(
  contract: Contract,
  constructorArguments: any[] = [],
  libraries: any = {}
) {
  try {
    await hre.run("verify:verify", {
      address: contract.address,
      constructorArguments: constructorArguments,
      libraries: libraries,
    });
  } catch (e) {
    if (e instanceof NomicLabsHardhatPluginError) {
      if (e.message.includes("Already Verified")) {
        console.log("Already Verified");
      } else {
        // rethrow error
        throw e;
      }
    }
  }
}
