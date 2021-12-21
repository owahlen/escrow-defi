import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments } = hre;
  const { deploy } = deployments;
  const [seller] = await hre.ethers.getSigners();

  await deploy("Escrow", {
    from: seller.address,
    log: true,
  });
};

export default func;
func.tags = ["Escrow"];
