import { Provider } from "@ethersproject/abstract-provider";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import hre, { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { Escrow } from "../../typechain";
import { near } from "../shared/assertions";
import { isLocalChain, verifyOnEtherscan } from "../shared/network";
import { step } from "mocha-steps";

chai.use(near);

describe("Escrow Integration", function () {
  this.timeout(120000);
  let provider: Provider;
  let escrow: Escrow;
  let seller: SignerWithAddress, buyer: SignerWithAddress;
  let initialSellerBalance: BigNumber, initialBuyerBalance: BigNumber;
  const collateralFactor = BigNumber.from(2);
  const price = ethers.utils.parseEther("0.1");

  before(async function () {
    // if (isLocalChain()) {
    //  this.skip();
    // } else {
    //  ...
    // }
    console.log("Testing on testnet: '%s'", hre.network.name);
    provider = hre.ethers.provider;
  });

  step(
    "should have seller and buyer with at least twice the price as balance",
    async function () {
      // when:
      [seller, buyer] = await ethers.getSigners();
      initialSellerBalance = await provider.getBalance(seller.address);
      initialBuyerBalance = await provider.getBalance(buyer.address);
      // then:
      console.log(
        "Seller has address %s and balance %s",
        seller.address,
        ethers.utils.formatEther(initialSellerBalance)
      );
      console.log(
        "Buyer has address %s and balance %s",
        buyer.address,
        ethers.utils.formatEther(initialBuyerBalance)
      );
      expect(initialSellerBalance).gte(price.mul(2));
      expect(initialBuyerBalance).gte(price.mul(2));
    }
  );

  step("should deploy Escrow contract", async function () {
    // setup:
    console.log("Deploying 'Escrow' contract...");
    const Escrow = await ethers.getContractFactory("Escrow");
    // when:
    escrow = await Escrow.deploy();
    await escrow.deployed();
    // then:
    console.log("'Escrow' contract deployed at address %s", escrow.address);
    const deployTx = escrow.deployTransaction;
    const deployTxReceipt = await deployTx.wait();
    expect(deployTxReceipt.confirmations).greaterThanOrEqual(1);
  });

  step("should verify 'Escrow' contract on Etherscan", async function () {
    // setup:
    if (isLocalChain()) {
      console.log("Skipping Etherscan verification on local chain.");
    } else {
      console.log("Verifying 'Escrow' contract on Etherscan...");
      const deployTx = escrow.deployTransaction;
      await deployTx.wait(3);
      // when/then (should not throw)
      await verifyOnEtherscan(escrow);
    }
  });

  step("should execute 'setPrice'.", async function () {
    // setup:
    console.log("Calling 'setPrice'...");
    // when setPrice:
    const setPriceTx = await escrow.setPrice(price, {
      value: price.mul(collateralFactor),
    });
    const setPriceTxReceipt = await setPriceTx.wait();
    // then:
    console.log(
      "'setPrice' transaction (%s) succeeded with %d confirmations",
      setPriceTxReceipt.transactionHash,
      setPriceTxReceipt.confirmations
    );
    expect(await provider.getBalance(escrow.address)).to.equal(
      price.mul(collateralFactor)
    );
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.sub(price.mul(2))
    );
  });

  step("should execute 'pay'.", async function () {
    // setup:
    console.log("Calling 'pay'...");
    // when pay:
    const payTx = await escrow.connect(buyer).pay({ value: price.mul(2) });
    const payTxReceipt = await payTx.wait();
    // then:
    console.log(
      "'pay' transaction (%s) succeeded with %d confirmations",
      payTxReceipt.transactionHash,
      payTxReceipt.confirmations
    );
    expect(await provider.getBalance(escrow.address)).to.equal(
      price.mul(collateralFactor).mul(2)
    );
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.sub(price.mul(2))
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance.sub(price.mul(2))
    );
  });

  step("should execute 'confirmReceived'.", async function () {
    // setup:
    console.log("Calling 'confirmReceived'...");
    // when confirmReceived:
    const confirmReceivedTx = await escrow.connect(buyer).confirmReceived();
    const confirmReceivedTxReceipt = await confirmReceivedTx.wait();
    // then:
    console.log(
      "'confirmReceived' transaction (%s) succeeded with %d confirmations",
      confirmReceivedTxReceipt.transactionHash,
      confirmReceivedTxReceipt.confirmations
    );
    expect(await provider.getBalance(escrow.address)).to.be.near(
      price.mul(collateralFactor.add(1))
    );
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.sub(price.mul(collateralFactor))
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance.sub(price)
    );
  });

  step("should execute 'payout'.", async function () {
    // setup:
    console.log("Calling 'payout'...");
    // when payout:
    const payoutTx = await escrow.payout();
    const payoutTxReceipt = await payoutTx.wait();
    // then:
    console.log(
      "'payout' transaction (%s) succeeded with %d confirmations",
      payoutTxReceipt.transactionHash,
      payoutTxReceipt.confirmations
    );
    expect(await provider.getBalance(escrow.address)).to.be.equal(0);
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.add(price)
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance.sub(price)
    );
  });

  step("should reset balances of seller and buyer", async function () {
    // setup:
    console.log("Resetting balances of seller and buyer...");
    // when this step is reached the buyer has transferred price to the seller
    // this step pays back this amount
    // when:
    const resetBalancesTx = await seller.sendTransaction({
      to: buyer.address,
      value: price,
    });
    const resetBalancesTxReceipt = await resetBalancesTx.wait();
    // then:
    console.log(
      "resetBalances transaction (%s) succeeded with %d confirmations",
      resetBalancesTxReceipt.transactionHash,
      resetBalancesTxReceipt.confirmations
    );
    expect(await provider.getBalance(escrow.address)).to.be.equal(0);
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance
    );
  });
});
