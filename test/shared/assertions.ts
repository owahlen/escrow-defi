import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";

declare global {
  export namespace Chai {
    // eslint-disable-next-line no-unused-vars
    interface Assertion {
      near(actual: BigNumber): void;
    }
  }
}

export const EPSILON: BigNumber = ethers.utils.parseEther("0.1");

// workaround for issue https://github.com/EthWorks/Waffle/issues/512
// eslint-disable-next-line no-undef
export function near(chai: Chai.ChaiStatic): void {
  const Assertion = chai.Assertion;

  Assertion.addMethod("near", function (actual: BigNumber): void {
    const expected = <BigNumber>this._obj;
    const delta: BigNumber = expected.sub(actual).abs();

    this.assert(
      delta.lte(EPSILON),
      "expected #{exp} to be near #{act}",
      "expected #{exp} to not be near #{act}",
      expected.toString(),
      actual.toString()
    );
  });
}
