require("dotenv").config({ path: __dirname + "/../.env" });
const Web3 = require("web3");
const { getAmountToken } = require("./getData");
const { signMessage } = require("./signMessage");
const { randomNumberAbi } = require("./abi");

// const randomNumberAddress = "0x476A2741Bf8a4dD75A3B0c533aC4e330B5f4d78f";
const randomNumberAddress = "0xCFe32bFDEC91EDbFBe811abCF87Dcd043d9Ac8d0";
myPrivateKey = process.env.PRIVATE_KEY;
const addressOwner = "0xa30DE202EB5D5e706E05e3F10134F96BB42Abfe2";
const web3 = new Web3(
  "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
);
const url = "https://goerli.etherscan.io/tx/";

async function connectWallet() {
  randomNumberContract = await new web3.eth.Contract(
    randomNumberAbi,
    randomNumberAddress
  );
  await web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

  return randomNumberContract;
}

async function calTotalToken() {
  const result1 = await getAmountToken(process.env.ADDRESS_POOL_1);
  const result2 = await getAmountToken(process.env.ADDRESS_POOL_2);
  const result3 = await getAmountToken(process.env.ADDRESS_POOL_3);
  return String(
    parseInt(
      parseFloat(result1[0]) +
        parseFloat(result1[1]) +
        parseFloat(result2[0]) +
        parseFloat(result2[1]) +
        parseFloat(result3[0]) +
        parseFloat(result3[1])
    )
  );
}

async function getRandomNumberBaseOnUniswap(point) {
  const randomNumberContract = await connectWallet();
  const totalToken = await calTotalToken();
  const signature = signMessage(
    randomNumberAddress,
    {
      aString: totalToken,
      aPoint: point,
    },
    myPrivateKey
  );

  rs = await randomNumberContract.methods
    ._getRandomNumberInRange(totalToken, point, 1, 10000000000, signature)
    .call({
      from: "0xa30DE202EB5D5e706E05e3F10134F96BB42Abfe2",
    });

  return rs;
}

async function callRandomGenerationFunction() {
  const randomNumberContract = await connectWallet();
  let re;
  await randomNumberContract.methods
    .requestRandomWords()
    .send({
      from: addressOwner,
      gas: 1000000,
    })
    .on("receipt", function (receipt) {
      re = url + receipt.transactionHash;
    });

  const rs = await randomNumberContract.methods.lastRequestId().call({
    from: addressOwner,
  });
  return { rs, re };
}

async function getRandomNumberBaseOnUniswapWithNonceNumber(point) {
  const randomNumberContract = await connectWallet();
  const totalToken = await calTotalToken();
  const signature = signMessage(
    randomNumberAddress,
    {
      aString: totalToken,
      aPoint: point,
    },
    myPrivateKey
  );

  await randomNumberContract.methods
    ._getRandomNumberWithNonceNumber(totalToken, point, 1, 100000000, signature)
    .send({
      from: addressOwner,
      gas: 1000000,
    });
  const x = await web3.eth.getPastLogs({
    toBlock: "latest",
    address: randomNumberAddress,
  });

  return { rs: parseInt(x[0].data), re: url + x[0].transactionHash };
}

async function checkRandomNumber(requestId) {
  const randomNumberContract = await connectWallet();

  const rs = await randomNumberContract.methods.s_requests(requestId).call({
    from: addressOwner,
  });

  return JSON.parse(JSON.stringify(rs));
}

async function getRandomNumberChainlink(requestId) {
  const randomNumberContract = await connectWallet();

  const rs = await randomNumberContract.methods
    .getRequestStatus(requestId)
    .call({
      from: addressOwner,
    });

  return JSON.parse(JSON.stringify(rs)).randomWords[0];
}

function getRandomNumberBaseOnChainLink(callback) {
  callRandomGenerationFunction().then((x) => {
    const signChecking = x.rs; //85946428197776467347512415917421767876221173732689737835379932829953754267951
    const transactionHash = x.re; //https://goerli.etherscan.io/tx/0x3897f9da118100ba9e2fdad0acf1960c4c2abb750100e7c18b83b2c55e36dcce
    const setTimer = setInterval(async () => {
      const rs = await checkRandomNumber(signChecking);
      console.log("wait", rs);
      if (rs.fulfilled) {
        clearInterval(setTimer);
        const randomNumber = await getRandomNumberChainlink(signChecking);
        callback({
          randomNumber,
          transactionHash,
        });
        //TODO...
      }
    }, 10000);
  });
}

module.exports.getRandomNumberBaseOnUniswap = getRandomNumberBaseOnUniswap;
module.exports.getRandomNumberBaseOnChainLink = getRandomNumberBaseOnChainLink;
module.exports.getRandomNumberBaseOnUniswapWithNonceNumber =
  getRandomNumberBaseOnUniswapWithNonceNumber;
