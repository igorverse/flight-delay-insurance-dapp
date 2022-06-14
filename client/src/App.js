import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abiInsuranceFactory from './utils/InsuranceFactory.json'
import abiInsurance from './utils/Insurance.json'
import api from './services/api'
import FlightCard from './components/FlightCard'
import Loader from './components/Loader'
import { convertDateFormat } from './utils/utils'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [notFoundFlight, setNotFoundFlight] = useState(false)
  const [flight, setFlight] = useState()
  const [allInsurances, setAllInsurances] = useState([])
  const [isFilled, setIsFilled] = useState(false)
  const [isAlreadyRegisterd, setIsAlreadyRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOracle, setIsLoadingOracle] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)

  const contractAddress = '0xD2012b1f5308C4991E776835b927cEa0eb758c25'

  const insuranceFactoryContractABI = abiInsuranceFactory.abi
  const insuranceContractABI = abiInsurance.abi

  const getFlightInformation = (flightNumber) => {
    api
      .get(`/${flightNumber}`)
      .then((response) => {
        setFlight(response.data)
        setNotFoundFlight(false)
      })
      .catch((err) => {
        setNotFoundFlight(true)
        console.log(err)
      })
  }

  const handleChange = (event) => {
    setFlightNumber(event.target.value)

    if (event.target.value.length > 0) {
      setIsFilled(true)
    } else {
      setIsFilled(false)
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Make sure you have metamask!')
        return
      } else {
        console.log('We have the ethereum object', ethereum)
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' })

      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account:', account)
        setCurrentAccount(account)
        getAllInsurancesInfo()
      } else {
        console.log('No authorized account found')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask!')
        return
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
      getAllInsurancesInfo()
    } catch (error) {
      console.log(error)
    }
  }

  const askForInsurance = async () => {
    try {
      const { ethereum } = window

      for (let insurance of allInsurances) {
        if (
          insurance.flightNumber.toNumber() === Number(flightNumber) &&
          insurance.insured.toLowerCase() === currentAccount.toLowerCase()
        ) {
          setIsAlreadyRegistered(true)
          throw new Error('Já foi solicitado seguro para este voo')
        }
      }

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const verxusInsuranceContract = new ethers.Contract(
          contractAddress,
          insuranceFactoryContractABI,
          signer
        )

        const { airlinecompany, flightnumber, premium, payout, departuredate } =
          flight

        const depositPremium = signer.sendTransaction({
          from: currentAccount,
          to: contractAddress,
          value: ethers.utils.parseEther(String(premium)),
        })

        await depositPremium

        const insuranceTxn = await verxusInsuranceContract.createInsurance(
          airlinecompany,
          flightnumber,
          ethers.utils.parseEther(String(premium)),
          ethers.utils.parseEther(String(payout)),
          +new Date(departuredate)
        )

        setIsLoading(true)

        await insuranceTxn.wait()

        console.log('Mined --', insuranceTxn.hash)
        setIsLoading(false)

        const count = await verxusInsuranceContract.getAllInsurances()

        getAllInsurancesInfo()

        console.log('Retrieved total insurance count...', count)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askForPayout = async (contractAddress, flightNumber) => {
    const oracleFlightStatus = await api
      .get(`/${flightNumber}`)
      .then((response) => response.data.isdelayedorcanceled)
      .catch((err) => {
        console.log(err)
      })

    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const insuranceContract = new ethers.Contract(
          contractAddress,
          insuranceContractABI,
          signer
        )

        setIsLoadingOracle(true)
        const oracleAnalyze = await insuranceContract.callOracle(
          oracleFlightStatus
        )

        await oracleAnalyze.wait()
        setIsLoadingOracle(false)
        setShowStatus(false)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error)
    }
  }

  const hasContractFinished = async (contractAddress) => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)

        const contractBalance = await provider.getBalance(contractAddress)

        const treatedContractBalance = ethers.utils.formatEther(contractBalance)

        const hasFinished = treatedContractBalance === '0.0' ? true : false

        setIsFinished(hasFinished)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllInsurancesInfo = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const verxusInsuranceContract = new ethers.Contract(
          contractAddress,
          insuranceFactoryContractABI,
          signer
        )

        const insurances = await verxusInsuranceContract.getAllInsurances()

        console.log(insurances)

        let insurancesCleaned = []
        insurances.forEach((insurance) => {
          insurancesCleaned.push({
            contractAddress: insurance.contractAddress,
            insured: insurance.insured,
            airlineCompany: insurance.airlineCompany,
            flightNumber: insurance.flightNumber,
            premium: insurance.premium,
            payout: insurance.payout,
            departureDate: insurance.departureDate,
            timestamp: new Date(insurance.timestamp * 1000),
            isContractActive: true,
          })
        })

        setAllInsurances(insurancesCleaned.reverse())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  return (
    <div className="appContainer">
      <div className="connectedWallet">
        {currentAccount ? (
          <div className="connected">
            <p>{currentAccount}</p>
          </div>
        ) : (
          <p className="disconnected">• carteira desconectada</p>
        )}
      </div>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">✈️ proteja-se contra voos cancelados!</div>

          <div className="bio">
            contrate seu seguro paramétrico por meio de{' '}
            <span>smart contracts</span> baseados em <span>blockchain</span>
          </div>

          {!currentAccount && (
            <button className="buttons" onClick={connectWallet}>
              Conecte sua carteira 😉
            </button>
          )}

          {currentAccount && !flight && (
            <div className="forms">
              <div className="flightForm">
                <div>
                  <input
                    className="flightNumber"
                    type="number"
                    name="flightNumber"
                    placeholder="número de voo"
                    value={flightNumber}
                    onChange={handleChange}
                  />
                  {notFoundFlight && (
                    <div>
                      <p>🤔 🤔 🤔 </p>
                      <p>voo não encontrado!</p>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    className="buttons"
                    type="submit"
                    value="Pesquisar voo"
                    required="required"
                    onClick={() => {
                      if (isFilled) {
                        getFlightInformation(flightNumber)
                        setIsFilled(false)
                        setIsAlreadyRegistered(false)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {flight && (
            <div className="flightCard">
              <FlightCard {...flight}></FlightCard>
              <div className="loading">{isLoading && <Loader></Loader>}</div>
              {isAlreadyRegisterd && (
                <p className="registeredFlight">
                  você já contratou seguro para este voo 🙃
                </p>
              )}
              <div className="buttonInsuranceWrapper">
                <button
                  className="buttons back"
                  onClick={() => {
                    setFlight(null)
                    setFlightNumber('')
                  }}
                >
                  Voltar
                </button>
                <button className="buttonInsurance" onClick={askForInsurance}>
                  solicitar seguro 🚀
                </button>
              </div>
            </div>
          )}
          <div className="contracts">
            <h2>seus contratos:</h2>
            {allInsurances.map((insurance, index) => {
              if (insurance.insured.toLowerCase() === currentAccount) {
                return (
                  <div key={index} className="contract">
                    <div className="showContract">
                      <a
                        href={`https://rinkeby.etherscan.io/address/${insurance.contractAddress}`}
                        target="_blank"
                      >
                        {insurance.contractAddress}
                      </a>
                    </div>
                    <div>
                      <span>companhia aérea:</span> {insurance.airlineCompany}
                    </div>
                    <div>
                      <span>número de voo: </span>{' '}
                      {insurance.flightNumber.toNumber()}
                    </div>
                    <div>
                      <span>prêmio:</span>{' '}
                      {ethers.utils.formatEther(insurance.premium.toString())}{' '}
                      ETH
                    </div>
                    <div>
                      <span>recompensa:</span>{' '}
                      {ethers.utils.formatEther(insurance.payout.toString())}{' '}
                      ETH
                    </div>
                    <div>
                      <span>data de partida:</span>{' '}
                      {convertDateFormat(
                        String(new Date(insurance.departureDate.toNumber()))
                      )}
                    </div>
                    <div>
                      <span>data de registro:</span>{' '}
                      {convertDateFormat(String(new Date()), true)}
                    </div>
                    <div className="statusButtonWrapper">
                      <button
                        className="statusButton"
                        onClick={() => {
                          hasContractFinished(insurance.contractAddress)
                          setShowStatus(true)
                          setCurrentIndex(index)
                        }}
                      >
                        checar status do contrato
                      </button>
                    </div>
                    {showStatus && index === currentIndex && (
                      <div>
                        {Date.now() + 3600 >
                          insurance.departureDate.toNumber() && !isFinished ? (
                          <div className="buttonContractWrapper">
                            <button
                              className="buttonContract"
                              onClick={() =>
                                askForPayout(
                                  insurance.contractAddress,
                                  insurance.flightNumber.toString()
                                )
                              }
                            >
                              solicitar análise 🔬
                            </button>
                            <div className="loading">
                              {isLoadingOracle && <Loader></Loader>}
                            </div>
                          </div>
                        ) : isFinished ? (
                          <p className="finishedContract">contrato analisado</p>
                        ) : (
                          <p className="activeContract">contrato ativo</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              }
            })}
            {!allInsurances.some(
              (insurance) => insurance.insured.toLowerCase() === currentAccount
            ) && (
              <div className="noPolicies">
                <p className="sad">😞</p>
                <p>você ainda não contratou nenhum seguro</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
