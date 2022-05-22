pragma solidity ^0.8.0;

contract Insurance {
    address public insurer;
    address public insured;
    string airlineCompany;
    uint256 public flightNumber;
    uint256 public premium;
    uint256 payout;
    bool public isFlightDelayed;
    uint256 public departureDate;
    uint256 public timestamp;
    bool isOracleAlreadyCalled = false;

    constructor(
        address _insurer,
        address _insured,
        string memory _airlineCompany,
        uint256 _flightNumber,
        uint256 _premium,
        uint256 _payout,
        uint256 _departureDate
    ) public {
        insurer = _insurer;
        insured = _insured;
        airlineCompany = _airlineCompany;
        flightNumber = _flightNumber;
        premium = _premium;
        payout = _payout;
        departureDate = _departureDate;
        payout = _payout;
        isFlightDelayed = false;
        timestamp = block.timestamp;
    }

    function transferPayout(address payable recipient) public payable {
        require(msg.sender == insured);

        recipient.transfer(payout);
    }

    function callOracle(bool _oracleInformation) public {
        require(msg.sender == insured);
        require(!isOracleAlreadyCalled);

        isFlightDelayed = _oracleInformation;

        if (isFlightDelayed) {
            transferPayout(payable(insured));
        } else {
            transferPayout(payable(insurer));
        }

        isOracleAlreadyCalled = true;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}

contract InsuranceFactory {
    Insurance[] insurances;
    address provider = msg.sender;
    address providerContractAddress = address(this);
    bool isContractActive = true;

    constructor() payable {}

    event NewInsurance(
        address indexed insured,
        string airlineCompany,
        uint256 flightNumber,
        uint256 premium,
        uint256 payout,
        uint256 departureDate,
        uint256 timestamp
    );

    function createInsurance(
        string memory _airlineCompany,
        uint256 _flightNumber,
        uint256 _premium,
        uint256 _payout,
        uint256 _departureDate
    ) public payable {
        require(isContractActive);
        require(hasBalanceToCoverPayout(_premium));

        Insurance insurance = new Insurance(
            provider,
            msg.sender,
            _airlineCompany,
            _flightNumber,
            _premium,
            _payout,
            _departureDate
        );
        insurances.push(insurance);

        emit NewInsurance(
            msg.sender,
            _airlineCompany,
            _flightNumber,
            _premium,
            _payout,
            _departureDate,
            block.timestamp
        );

        require(msg.value == _premium);
        payable(providerContractAddress).transfer(msg.value);

        (bool success, ) = (address(insurance)).call{value: _payout}("");
        require(success, "Failed to withdraw money from contract.");
    }

    function getAllInsurances() public view returns (Insurance[] memory) {
        return insurances;
    }

    function getProvider() public view returns (address) {
        return provider;
    }

    function getResidualEth() public payable {
        require(msg.sender == provider);

        payable(provider).transfer(address(this).balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function endContract() public {
        require(msg.sender == provider);
        isContractActive = false;
        getResidualEth();
    }

    function hasBalanceToCoverPayout(uint256 _payout)
        public
        view
        returns (bool)
    {
        if (_payout >= address(providerContractAddress).balance) {
            return false;
        }

        return true;
    }

    receive() external payable {}
}
