// const { signMessage } = require("./signMessage");
// function test() {
//   const x = signMessage(
//     "0xCFe32bFDEC91EDbFBe811abCF87Dcd043d9Ac8d0",
//     {
//       aString: "362168437253",
//       aPoint: 123,
//     },
//     "5b68e342531435192b45a5d1d7a88795f328eeaf636b0886e97b0d1980be75c3"
//   );
//   console.log(x);
//   return x;
// }

// test();

const {
  getRandomNumberBaseOnUniswap,
  callRandomGenerationFunction,
  getRandomNumberBaseOnChainlink,
  checkRandomNumber,
  getRandomNumberBaseOnUniswapWithNonceNumber,
  getRandomNumberBaseOnChainLink,
} = require("./getRandomNumber");

// async function a() {
//   const x = await callRandomGenerationFunction();
//   const signChecking = x.rs; //85946428197776467347512415917421767876221173732689737835379932829953754267951
//   const transactionHash = x.re; //https://goerli.etherscan.io/tx/0x3897f9da118100ba9e2fdad0acf1960c4c2abb750100e7c18b83b2c55e36dcce
//   const setTimer = setInterval(async () => {
//     const rs = await checkRandomNumber(signChecking);
//     console.log("wait", rs);
//     if (rs.fulfilled) {
//       clearInterval(setTimer);
//       const randomNumber = await getRandomNumberBaseOnChainlink(signChecking);
//       if (randomNumber) return randomNumber;
//       //TODO...
//     }
//   }, 10000);
// }
// a();
// const ethers = require("ethers");
// const abi = [
//   {
//     inputs: [
//       { internalType: "string", name: "_seed", type: "string" },
//       { internalType: "string", name: "_name", type: "string" },
//       { internalType: "string", name: "_version", type: "string" },
//     ],
//     stateMutability: "nonpayable",
//     type: "constructor",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       { indexed: true, internalType: "address", name: "addr", type: "address" },
//       {
//         indexed: false,
//         internalType: "uint256",
//         name: "number",
//         type: "uint256",
//       },
//     ],
//     name: "GetRandomNumber",
//     type: "event",
//   },
//   {
//     inputs: [
//       { internalType: "uint256", name: "_tokenFromUniswap", type: "uint256" },
//       { internalType: "uint256", name: "_from", type: "uint256" },
//       { internalType: "uint256", name: "_to", type: "uint256" },
//       { internalType: "bytes", name: "_signature", type: "bytes" },
//     ],
//     name: "_getRandomNumberInRange",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
// ];

// const address = "0x19594C37FD57086F8c8223eb3aCCEdf7b3b55bEd";

// const randomNumberAddress = "0xeebD02CeB243B005F1bb38e023D3eaC419b1D36E";
// const ethers = require("ethers");
// async function main() {
//   const provider = new ethers.providers.WebSocketProvider(
//     "wss://goerli.infura.io/ws/v3/a41b2a45a79e4b67b21cdf53a85f6529"
//   );
//   const contract = new ethers.Contract(
//     randomNumberAddress,
//     randomNumberAbi,
//     provider
//   );
//   contract.on("getRandomNumber", (addr, number, event) => {
//     let info = {
//       addr: addr,
//       number: number,
//       data: event,
//     };
//     console.log(JSON.stringify(info, null, 4));
//   });
// }

// async function main() {
//   const x = await getRandomNumberBaseOnChainlink();
//   console.log(x);
// }

// main();
// main();
