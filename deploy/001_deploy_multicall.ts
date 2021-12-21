import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import multicallABI from "@usedapp/core/src/constants/abi/MultiCall.json";
import { Hardhat } from "@usedapp/core";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const chainId = await hre.getChainId();
  if (Hardhat.chainId !== +chainId) {
    // Multicall contract is only deployed on Hardhat chains.
    // If not existing useDapp tries to deploy this contract from the browser.
    return;
  }
  const { deployments } = hre;
  const { deploy } = deployments;
  const [seller] = await hre.ethers.getSigners();

  await deploy("Multicall", {
    from: seller.address,
    contract: {
      abi: multicallABI.abi,
      bytecode: multicallABI.bytecode,
    },
    log: true,
  });
};

export default func;
func.tags = ["Multicall"];
