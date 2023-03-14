//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract RandomNumber is EIP712, VRFConsumerBaseV2, ConfirmedOwner {
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    event getRandomNumber(uint number);

    mapping(uint256 => RequestStatus)
    public s_requests;
    VRFCoordinatorV2Interface COORDINATOR;

    uint64 s_subscriptionId;

    uint256[] public requestIds;
    uint256 public lastRequestId;
    bytes32 keyHash =
    0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    uint32 nonce = 1;
    string private seed;

    constructor(string memory _seed, string memory _name, string memory _version, uint64 subscriptionId) EIP712(_name, _version)  VRFConsumerBaseV2(0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D)
    ConfirmedOwner(msg.sender){
        seed = _seed;
        COORDINATOR = VRFCoordinatorV2Interface(
            0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D
        );
        s_subscriptionId = subscriptionId;
    }


    function validateAmountFunction(string memory _aString, uint256 _aPoint, bytes memory _signature) internal view returns (address){
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
                keccak256("Number(string aString,uint256 aPoint)"),
                keccak256(bytes(_aString)),
                _aPoint
            )));
        address signer = ECDSA.recover(digest, _signature);
        require(signer == msg.sender, "MessageVerifier: invalid signature");
        require(signer != address(0), "ECDSAUpgradeable: invalid signature");
        return signer;
    }

    function _getRandomNumberInRange(string memory _tokenFromUniswap, uint256 _point, uint _from, uint _to, bytes memory _signature) external view returns (uint)  {
        require(_to > _from, "Range is not valid");
        require(validateAmountFunction(_tokenFromUniswap,_point, _signature) == msg.sender, "Not invalid");
        uint randomNumber = uint(
            keccak256(
                abi.encodePacked(
                    keccak256(
                        abi.encodePacked(
                            block.number,
                            block.difficulty,
                            block.timestamp,
                            msg.sender,
                            _point,
                            seed,
                            _tokenFromUniswap
                        )
                    )
                )
            )
        ) % (_to - _from + 1);
        return randomNumber + _from;
    }
      function _getRandomNumberWithNonceNumber(string memory _tokenFromUniswap, uint256 _point, uint _from, uint _to, bytes memory _signature) external {
        require(_to > _from, "Range is not valid");
        require(validateAmountFunction(_tokenFromUniswap,_point, _signature) == msg.sender, "Not invalid");
        uint randomNumber = uint(
            keccak256(
                abi.encodePacked(
                    keccak256(
                        abi.encodePacked(
                            block.number,
                            block.difficulty,
                            block.timestamp,
                            msg.sender,
                            _point,
                            seed,
                            _tokenFromUniswap,
                            nonce
                        )
                    )
                )
            )
        ) % (_to - _from + 1);
        nonce++;
        emit getRandomNumber(randomNumber);
    }

    function requestRandomWords()
    external
    onlyOwner
    returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
        randomWords : new uint256[](0),
        exists : true,
        fulfilled : false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

   
}
