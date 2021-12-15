import { BigNumber } from "@ethersproject/bignumber";

export function max(x: BigNumber, y: BigNumber): BigNumber {
  if (x.gte(y)) {
    return x;
  } else {
    return y;
  }
}
