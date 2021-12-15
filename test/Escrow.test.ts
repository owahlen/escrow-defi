import { Provider } from "@ethersproject/abstract-provider";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { Escrow } from "../typechain";
import { near } from "./shared/assertions";

chai.use(near);

// see: https://dev.to/steadylearner/how-to-make-a-fullstack-dapp-with-react-hardhat-and-ether-js-with-examples-4fi2
// see: https://dev.to/carlomigueldy/unit-testing-a-solidity-smart-contract-using-chai-mocha-with-typescript-3gcj
describe("Escrow", function () {
  let provider: Provider;
  let escrow: Escrow;
  let seller: SignerWithAddress, buyer: SignerWithAddress;
  let initialSellerBalance: BigNumber, initialBuyerBalance: BigNumber;
  const initialEscrowBalance = ethers.utils.parseEther("2.0");

  this.beforeEach(async () => {
    const Escrow = await ethers.getContractFactory("Escrow");
    provider = Escrow.signer.provider!;
    [seller, buyer] = await ethers.getSigners();
    initialSellerBalance = await provider.getBalance(seller.address);
    initialBuyerBalance = await provider.getBalance(buyer.address);
    escrow = await Escrow.deploy({ value: initialEscrowBalance });
  });

  it("should have received 2 ETH from seller and should have state 'Created' when constructed.", async function () {
    // when/then:
    const balanceSeller = await provider.getBalance(seller.address);
    const sellerContractCreationCosts = initialSellerBalance.sub(balanceSeller);
    expect(await provider.getBalance(escrow.address)).to.equal(
      initialEscrowBalance
    );
    expect(balanceSeller).to.be.near(
      initialSellerBalance.sub(initialEscrowBalance)
    );
    expect(await provider.getBalance(buyer.address)).to.equal(
      initialBuyerBalance
    );
    // sellerContractCreationCosts are higher than escrowInitialValue due to gas spent on contract
    expect(sellerContractCreationCosts).to.be.near(initialEscrowBalance);
    expect(await escrow.seller()).to.equal(seller.address);
    expect(await escrow.state()).to.equal(0); // Created
    expect(await escrow.buyer()).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
  });

  it("should emit 'Aborted', set contract state to 'Inactive' and refund seller when aborted.", async function () {
    // when
    await expect(escrow.abort()).to.emit(escrow, "Aborted");
    // then
    expect(await escrow.state()).to.equal(3); // Inactive
    const sellerBalance = await provider.getBalance(seller.address);
    expect(await provider.getBalance(escrow.address)).to.equal(0);
    // the initialBalanceSeller is not completely refunded due to gas spent on contract
    expect(initialSellerBalance).to.be.near(sellerBalance);
  });

  it("should revert with 'InvalidState' if abort is called a second time.", async function () {
    // setup
    const abortTx = await escrow.abort();
    abortTx.wait();
    // when/then:
    await expect(escrow.abort()).to.be.revertedWith("InvalidState()");
  });

  it("should revert with 'OnlySeller' if abort is called by buyer.", async function () {
    // when/then:
    await expect(escrow.connect(buyer).abort()).to.be.revertedWith(
      "OnlySeller()"
    );
  });

  it("should emit 'PurchaseConfirmed', store the buyer and set state to 'Locked' when buyer calls 'confirmPurchase'.", async function () {
    // when:
    await expect(
      escrow.connect(buyer).confirmPurchase({ value: initialEscrowBalance })
    ).to.emit(escrow, "PurchaseConfirmed");
    // then:
    expect(await escrow.buyer()).to.equal(buyer.address);
    expect(await escrow.state()).to.equal(1); // Locked
    expect(await provider.getBalance(escrow.address)).to.equal(
      initialEscrowBalance.mul(2)
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance.sub(initialEscrowBalance)
    );
  });

  it("should revert with 'InvalidState' if buyer calls 'confirmPurchase' when in state 'Aborted'", async function () {
    // setup:
    const abortTx = await escrow.abort();
    abortTx.wait();
    // when/then:
    await expect(
      escrow.connect(buyer).confirmPurchase({ value: initialEscrowBalance })
    ).to.be.revertedWith("InvalidState()");
  });

  it("should revert with 'InvalidCollateral' if buyer calls 'confirmPurchase' without depositing twice the price.", async function () {
    // when/then:
    await expect(
      escrow.connect(buyer).confirmPurchase({ value: 0 })
    ).to.be.revertedWith("InvalidCollateral()");
  });

  it("should emit 'ItemReceived', set state to 'Released' and pay price to the buyer if he calls 'confirmReceived'.", async function () {
    // setup:
    const confirmPurchaseTx = await escrow
      .connect(buyer)
      .confirmPurchase({ value: initialEscrowBalance });
    confirmPurchaseTx.wait();
    const purchaseBuyerBalance = await provider.getBalance(buyer.address);
    const purchaseEscrowBalance = await provider.getBalance(escrow.address);
    // when:
    await expect(escrow.connect(buyer).confirmReceived()).to.emit(
      escrow,
      "ItemReceived"
    );
    // then:
    expect(await escrow.state()).to.equal(2); // Released
    const receivedBuyerBalance = await provider.getBalance(buyer.address);
    const receivedEscrowBalance = await provider.getBalance(escrow.address);

    // 9998.98 ~= 2/2 + 9997.99
    expect(receivedBuyerBalance).to.be.near(
      initialEscrowBalance.div(2).add(purchaseBuyerBalance)
    );

    // 2.99 ~= 4 - 2/2
    expect(receivedEscrowBalance).to.be.near(
      purchaseEscrowBalance.sub(initialEscrowBalance.div(2))
    );
  });

  it("should revert with 'InvalidState' if buyer calls 'confirmReceived' when in state 'Inactive'", async function () {
    // setup:
    // buyer calls confirmPurchase -> contract registers buyer and goes into state 'Locked'
    const confirmPurchaseTx = await escrow
      .connect(buyer)
      .confirmPurchase({ value: initialEscrowBalance });
    confirmPurchaseTx.wait();
    // buyer calls confirmReceived -> state 'Released'
    const confirmReceivedTx = await escrow.connect(buyer).confirmReceived();
    confirmReceivedTx.wait();
    // payout -> state 'Inactive
    const payoutTx = await escrow.payout();
    payoutTx.wait();
    // when/then:
    await expect(escrow.connect(buyer).confirmReceived()).to.be.revertedWith(
      "InvalidState()"
    );
  });

  it("should revert with 'OnlyBuyer' if seller calls 'confirmReceived'", async function () {
    // setup:
    const confirmPurchaseTx = await escrow
      .connect(buyer)
      .confirmPurchase({ value: initialEscrowBalance });
    confirmPurchaseTx.wait();
    // when/then:
    await expect(escrow.confirmReceived()).to.be.revertedWith("OnlyBuyer()");
  });

  it("should emit 'BuyerRefunded', set state to 'Created' and refund collateral to buyer when seller calls 'refundBuyer'.", async function () {
    // setup:
    const confirmPurchaseTx = await escrow
      .connect(buyer)
      .confirmPurchase({ value: initialEscrowBalance });
    confirmPurchaseTx.wait();
    // when:
    await expect(escrow.refundBuyer()).to.emit(escrow, "BuyerRefunded");
    // then:
    expect(await escrow.state()).to.equal(0); // Created
    const receivedBuyerBalance = await provider.getBalance(buyer.address);
    const receivedEscrowBalance = await provider.getBalance(escrow.address);
    expect(receivedBuyerBalance).to.be.near(initialBuyerBalance);
    expect(receivedEscrowBalance).to.be.near(initialEscrowBalance);
  });

  it("should revert with 'InvalidState' if seller calls 'refundBuyer' when in state 'Created'", async function () {
    // when/then:
    await expect(escrow.refundBuyer()).to.be.revertedWith("InvalidState()");
  });

  it("should revert with 'OnlySeller' if buyer calls 'refundBuyer'", async function () {
    // setup:
    const confirmPurchaseTx = await escrow
      .connect(buyer)
      .confirmPurchase({ value: initialEscrowBalance });
    confirmPurchaseTx.wait();
    // when/then:
    await expect(escrow.connect(buyer).refundBuyer()).to.be.revertedWith(
      "OnlySeller()"
    );
  });

  it("should emit 'Payout', set state to 'Inactive' and payout seller when he calls 'payout'.", async function () {
    // setup:
    // buyer calls confirmPurchase -> contract registers buyer and goes into state 'Locked'
    const confirmPurchaseTx = await escrow
      .connect(buyer)
      .confirmPurchase({ value: initialEscrowBalance });
    confirmPurchaseTx.wait();
    // buyer calls confirmReceived -> state 'Released'
    const confirmReceivedTx = await escrow.connect(buyer).confirmReceived();
    confirmReceivedTx.wait();
    // when:
    await expect(await escrow.payout()).to.emit(escrow, "Payout");
    // then:
    expect(await escrow.state()).to.equal(3); // Inactive
    const payoutSellerBalance = await provider.getBalance(seller.address);
    const payoutEscrowBalance = await provider.getBalance(escrow.address);
    // 10000.99 ~= 10000 + 2/2
    expect(payoutSellerBalance).to.be.near(
      initialSellerBalance.add(initialEscrowBalance.div(2))
    );
    expect(payoutEscrowBalance).to.be.near(BigNumber.from(0));
  });

  it("should revert with 'InvalidState' if seller calls 'payout' when in state 'Created'", async function () {
    // setup:
    // buyer calls confirmPurchase -> contract registers buyer and goes into state 'Locked'
    const confirmPurchaseTx = await escrow
      .connect(buyer)
      .confirmPurchase({ value: initialEscrowBalance });
    confirmPurchaseTx.wait();
    // when/then:
    await expect(escrow.connect(buyer).payout()).to.be.revertedWith(
      "OnlySeller()"
    );
  });
});
