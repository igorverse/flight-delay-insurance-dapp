// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract InsuranceProvider {
    uint256 totalInsurances;
    address provider = msg.sender;

    event NewInsurance(
        address indexed from,
        uint256 timestamp,
        string message,
        uint256 flightNumber,
        uint256 premium,
        uint256 payout,
        uint256 departureDate,
        bool isFlightDelayed
    );

    struct Insurance {
        address insured;
        string airlineCompany;
        uint256 flightNumber;
        uint256 premium;
        uint256 payout;
        uint256 departureDate;
        bool isFlightDelayed;
        uint256 timestamp;
    }

    Insurance[] insurances;

    constructor() payable {}

    function insurance(
        string memory _airlineCompany,
        uint256 _flightNumber,
        uint256 _premium,
        uint256 _payout,
        uint256 _departureDate,
        bool _isFlightDelayed
    ) public {
        totalInsurances += 1;
        console.log(
            "%s got insured w/ airlineCompany %s ",
            msg.sender,
            _airlineCompany
        );

        insurances.push(
            Insurance(
                msg.sender,
                _airlineCompany,
                _flightNumber,
                _premium,
                _payout,
                _departureDate,
                _isFlightDelayed,
                block.timestamp
            )
        );

        emit NewInsurance(
            msg.sender,
            block.timestamp,
            _airlineCompany,
            _flightNumber,
            _premium,
            _payout,
            _departureDate,
            _isFlightDelayed
        );
    }

    function fundContract(uint256 _premium) public payable {
        require(msg.value == _premium);
        payable(address(this)).transfer(msg.value);
    }

    function callOracle(bool isFlightDelayed) public payable {
        if (isFlightDelayed) {
            payable(msg.sender).transfer(msg.value);
        } else {
            payable(provider).transfer(msg.value);
        }
    }

    function getAllInsurances() public view returns (Insurance[] memory) {
        return insurances;
    }

    function getTotalInsurances() public view returns (uint256) {
        console.log("We have %d total insurances!", totalInsurances);
        return totalInsurances;
    }

    function getProvider() public view returns (address) {
        return provider;
    }

    receive() external payable {}
}
