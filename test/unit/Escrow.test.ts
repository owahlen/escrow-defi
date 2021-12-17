import { Provider } from "@ethersproject/abstract-provider";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chai, { expect } from "chai";
import hre, { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { Escrow } from "../../typechain";
import { near } from "../shared/assertions";
import { isLocalChain } from "../shared/network";

chai.use(near);

// see: https://dev.to/steadylearner/how-to-make-a-fullstack-dapp-with-react-hardhat-and-ether-js-with-examples-4fi2
// see: https://dev.to/carlomigueldy/unit-testing-a-solidity-smart-contract-using-chai-mocha-with-typescript-3gcj
describe("Escrow", function () {
  let provider: Provider;
  let escrow: Escrow;
  let seller: SignerWithAddress, buyer: SignerWithAddress;
  let initialSellerBalance: BigNumber, initialBuyerBalance: BigNumber;
  const collateralFactor = BigNumber.from(2);
  const price = ethers.utils.parseEther("1.0");

  before(function () {
    if (!isLocalChain()) {
      this.skip();
    }
  });

  this.beforeEach(async () => {
    provider = hre.ethers.provider;
    [seller, buyer] = await ethers.getSigners();
    initialSellerBalance = await provider.getBalance(seller.address);
    initialBuyerBalance = await provider.getBalance(buyer.address);
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy();
    await escrow.deployed();
  });

  it("should have no balance and state 'Inactive' when constructed.", async function () {
    expect(await provider.getBalance(escrow.address)).to.equal(0);
    expect(await escrow.price()).to.equal(0);
    expect(await escrow.seller()).to.equal(seller.address);
    expect(await escrow.buyer()).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await escrow.collateralFactor()).to.equal(collateralFactor);
    expect(await escrow.state()).to.equal(0); // Inactive
  });

  it("should have received 2*price from seller and have state 'Priced' when calling setPrice(1).", async function () {
    // when:
    await expect(
      escrow.setPrice(price, { value: price.mul(collateralFactor) })
    ).to.emit(escrow, "Priced");
    // then:
    expect(await provider.getBalance(escrow.address)).to.equal(
      price.mul(collateralFactor)
    );
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.sub(price.mul(collateralFactor))
    );
    expect(await escrow.state()).to.equal(1); // Priced
  });

  it("should revert with 'OnlySeller' if buyer calls 'setPrice(1)'.", async function () {
    // when/then:
    await expect(
      escrow
        .connect(buyer)
        .setPrice(price, { value: price.mul(collateralFactor) })
    ).to.be.revertedWith("OnlySeller()");
  });

  it("should revert with 'InvalidState' if 'setPrice(1) is called twice'.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    // when/then:
    await expect(
      escrow.setPrice(price, { value: price.mul(collateralFactor) })
    ).to.be.revertedWith("InvalidState()");
  });

  it("should revert with 'InvalidCollateral' if 'setPrice(1) is paid with invalid value.", async function () {
    // when/then:
    await expect(escrow.setPrice(price)).to.be.revertedWith(
      "InvalidCollateral()"
    );
  });

  it("should emit 'Paid', store the buyer and set state to 'Paid' when buyer calls 'pay'.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    // when:
    await expect(
      escrow.connect(buyer).pay({ value: price.mul(collateralFactor) })
    ).to.emit(escrow, "Paid");
    // then:
    expect(await escrow.buyer()).to.equal(buyer.address);
    expect(await escrow.state()).to.equal(2); // Paid
    expect(await provider.getBalance(escrow.address)).to.equal(
      price.mul(collateralFactor).mul(2)
    );
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.sub(price.mul(collateralFactor))
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance.sub(price.mul(collateralFactor))
    );
  });

  it("should revert with 'InvalidState' if buyer calls 'pay' twice.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    await escrow.connect(buyer).pay({ value: price.mul(collateralFactor) });
    // when/then:
    await expect(
      escrow.connect(buyer).pay({ value: price.mul(collateralFactor) })
    ).to.be.revertedWith("InvalidState()");
  });

  it("should revert with 'InvalidCollateral' if 'pay' is paid with invalid value.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    // when/then:
    await expect(escrow.connect(buyer).pay({ value: 0 })).to.be.revertedWith(
      "InvalidCollateral()"
    );
  });

  it("should set state to 'Settled' and pays collateral back to the buyer if he calls 'confirmReceived'.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    await escrow.connect(buyer).pay({ value: price.mul(collateralFactor) });
    // when:
    await expect(escrow.connect(buyer).confirmReceived()).to.emit(
      escrow,
      "Settled()"
    );
    // then:
    expect(await escrow.state()).to.equal(3); // Settled
    expect(await provider.getBalance(escrow.address)).to.equal(
      price.mul(collateralFactor.add(1))
    );
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.sub(price.mul(collateralFactor))
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance.sub(price)
    );
  });

  it("should revert with 'OnlyBuyer' if seller calls 'confirmReceived'", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    await escrow.connect(buyer).pay({ value: price.mul(collateralFactor) });
    // when/then:
    await expect(escrow.confirmReceived()).to.be.revertedWith("OnlyBuyer()");
  });

  it("should revert with 'InvalidState' if buyer calls 'confirmReceived' twice", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    await escrow.connect(buyer).pay({ value: price.mul(collateralFactor) });
    await escrow.connect(buyer).confirmReceived();
    // when/then:
    await expect(escrow.connect(buyer).confirmReceived()).to.be.revertedWith(
      "InvalidState()"
    );
  });

  it("should emit 'Refunded', set state to 'Priced' and refund collateral to buyer when seller calls 'refund'.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    await escrow.connect(buyer).pay({ value: price.mul(collateralFactor) });
    // when:
    await expect(escrow.refund()).to.emit(escrow, "Refunded");
    // then:
    expect(await escrow.state()).to.equal(1); // Priced
    expect(await provider.getBalance(escrow.address)).to.equal(
      price.mul(collateralFactor)
    );
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.sub(price.mul(collateralFactor))
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance
    );
  });

  it("should revert with 'OnlySeller' if buyer calls 'refundBuyer'", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    await escrow.connect(buyer).pay({ value: price.mul(collateralFactor) });
    // when/then:
    await expect(escrow.connect(buyer).refund()).to.be.revertedWith(
      "OnlySeller()"
    );
  });

  it("should revert with 'InvalidState' if seller calls 'refund' when in state 'Inactive'", async function () {
    // when/then:
    await expect(escrow.refund()).to.be.revertedWith("InvalidState()");
  });

  it("should emit 'Payout', set state to 'Inactive' and payout seller when he calls 'payout' in state 'Priced'.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    // when:
    await expect(await escrow.payout()).to.emit(escrow, "Payout");
    // then:
    expect(await escrow.state()).to.equal(0); // Inactive
    expect(await provider.getBalance(escrow.address)).to.equal(0);
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance
    );
    expect(await provider.getBalance(buyer.address)).to.be.equal(
      initialBuyerBalance
    );
  });

  it("should emit 'Payout', set state to 'Inactive' and payout seller when he calls 'payout' in state 'Settled'.", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    await escrow.connect(buyer).pay({ value: price.mul(collateralFactor) });
    await escrow.connect(buyer).confirmReceived();
    // when:
    await expect(await escrow.payout()).to.emit(escrow, "Payout");
    // then:
    expect(await escrow.state()).to.equal(0); // Inactive
    expect(await provider.getBalance(escrow.address)).to.equal(0);
    expect(await provider.getBalance(seller.address)).to.be.near(
      initialSellerBalance.add(price)
    );
    expect(await provider.getBalance(buyer.address)).to.be.near(
      initialBuyerBalance.sub(price)
    );
  });

  it("should revert with 'OnlySeller' if user calls 'payout'", async function () {
    // setup:
    await escrow.setPrice(price, { value: price.mul(collateralFactor) });
    // when/then:
    await expect(escrow.connect(buyer).payout()).to.be.revertedWith(
      "OnlySeller()"
    );
  });

  it("should revert with 'InvalidState' if seller calls 'payout' when in state 'Inactive'", async function () {
    // when/then:
    await expect(escrow.payout()).to.be.revertedWith("InvalidState()");
  });
});
