const { ecsign } = require("ethereumjs-util");
const { getMessage } = require("eip-712");

exports.signMessage = (verifyingContract, message, privateKey) => {
  const typeData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Number: [
        { name: "aString", type: "string" },
        { name: "aPoint", type: "uint256" },
      ],
    },
    primaryType: "Number",
    domain: {
      name: "NgocLe",
      version: "1.0.0",
      chainId: 5,
      verifyingContract,
    },
    message,
  };

  const messageFromData = getMessage(typeData, true); //using keccak256 => return Buffer
  const { r, s, v } = ecsign(messageFromData, Buffer.from(privateKey, "hex")); // return ecdsa signature include r, s, v

  return `0x${r.toString("hex")}${s.toString("hex")}${v.toString(16)}`; // combine into message
};
