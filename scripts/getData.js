const fetch = require("node-fetch");
const URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const headers = {
  "content-type": "application/json",
};

function modifer(s) {
  let query = `
    {
        pool(id: "${s.toLowerCase()}") {
          tick
          token0 {
            symbol
            id
            decimals
          }
          token1 {
            symbol
            id
            decimals
          }
          volumeToken0
          volumeToken1
          feeTier
          sqrtPrice
          liquidity
        }
      }
        `;
  const graphqlQuery = {
    operationName: "LeThanhNgoc",
    query: query,
    variables: {},
  };

  return {
    method: "POST",
    headers: headers,
    body: JSON.stringify(graphqlQuery),
  };
}

var getAmountToken = async function getData(s) {
  const response = await fetch(URL, modifer(s));
  const data = await response.json();
  return [data.data.pool.volumeToken0, data.data.pool.volumeToken1];
};

module.exports.getAmountToken = getAmountToken;
