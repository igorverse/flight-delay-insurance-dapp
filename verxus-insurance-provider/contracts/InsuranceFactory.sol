// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Insurance {
    uint256 totalInsurances;

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

    constructor(
        address _insured,
        string memory _airlineCompany,
        uint256 _flightNumber,
        uint256 _premium,
        uint256 _payout,
        uint256 _departureDate,
        bool _isFlightDelayed,
        uint256 _timestamp
    ) public payable {
        insured = _insured;
        airlineCompany = _airlineCompany;
        flightNumber = _flightNumber;
        premium = _premium;
        payout = _payout;
        departureDate = _departureDate;
        isFlightDelayed = _isFlightDelayed;
        timestamp = _timestamp;
    }

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

    function getAllInsurances() public view returns (Insurance[] memory) {
        return insurances;
    }

    function getTotalInsurances() public view returns (uint256) {
        console.log("We have %d total insurances!", totalInsurances);
        return totalInsurances;
    }

    function isFlightDelayed(bool oracleInformation) public returns (bool) {
        if (oracleInformation) {}
        return true;
    }
}

contract InsuranceProvider {
    function createInsurance(
        address _insured,
        string memory _airlineCompany,
        uint256 _flightNumber,
        uint256 _premium,
        uint256 _payout,
        uint256 _departureDate,
        bool _isFlightDelayed,
        uint256 _timestamp
    ) public {
        Insurance insurance = new Insurance(
            _insured,
            _airlineCompany,
            _flightNumber,
            _premium,
            _payout,
            _departureDate,
            _isFlightDelayed,
            _timestamp
        );
    }
}
