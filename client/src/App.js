import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './utils/InsuranceProvider.json'
import api from './services/api'
import FlightCard from './components/FlightCard'
import Loader from './components/Loader'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [notFoundFlight, setNotFoundFlight] = useState(false)
  const [flight, setFlight] = useState()
  const [allInsurances, setAllInsurances] = useState([])
  const [isFilled, setIsFilled] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [isAlreadyRegisterd, setIsAlreadyRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const contractAddress = '0x3D27275A540Ac0C108f97a1a29090821e68DFa49'

  const contractABI = abi.abi

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
        getAllInsurances()
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
      getAllInsurances()
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
          insurance.address.toLowerCase() === currentAccount.toLowerCase()
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
          contractABI,
          signer
        )

        let count = await verxusInsuranceContract.getTotalInsurances()
        console.log('Retrivied total insurance count...', count.toNumber())

        const { airlinecompany, flightnumber, premium, payout, departuredate } =
          flight

        const insuranceTxn = await verxusInsuranceContract.insurance(
          airlinecompany,
          flightnumber,
          premium,
          payout,
          +new Date(departuredate),
          false
        )

        setIsLoading(true)

        await insuranceTxn.wait()
        console.log('Mined --', insuranceTxn.hash)
        setIsLoading(false)

        count = await verxusInsuranceContract.getTotalInsurances()

        const premiumInEth = premium / 10000

        await verxusInsuranceContract.fundContract(
          ethers.utils.parseEther(premiumInEth)
        )

        getAllInsurances()

        console.log('Retrieved total insurance count...', count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askForPayout = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const verxusInsuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const oracleIsFlightDelayed = getFlightInformation('0')

        console.log(oracleIsFlightDelayed)

        const payoutResponse = await verxusInsuranceContract.callOracle(
          oracleIsFlightDelayed
        )

        console.log(payoutResponse)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllInsurances = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const verxusInsuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const insurances = await verxusInsuranceContract.getAllInsurances()

        let insurancesCleaned = []
        insurances.forEach((insurance) => {
          console.log(insurance)
          insurancesCleaned.push({
            address: insurance.insured,
            airlineCompany: insurance.airlineCompany,
            flightNumber: insurance.flightNumber,
            premium: insurance.premium,
            payout: insurance.payout,
            departureDate: insurance.departureDate,
            isFlightDelayed: insurance.isFlightDelayed,
            timestamp: new Date(insurance.timestamp * 1000),
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
              if (insurance.address.toLowerCase() === currentAccount) {
                return (
                  <div key={index} className="contract">
                    <div>
                      <span>companhia aérea:</span> {insurance.airlineCompany}
                    </div>
                    <div>
                      <span>número de voo: </span>{' '}
                      {insurance.flightNumber.toNumber()}
                    </div>
                    <div>
                      <span>prêmio:</span> {insurance.premium.toNumber()}
                    </div>
                    <div>
                      <span>recompensa:</span> {insurance.payout.toNumber()}
                    </div>
                    <div>
                      <span>data de partida:</span>{' '}
                      {insurance.departureDate.toNumber()}
                    </div>
                    <div>
                      <span>voo cancelado:</span>{' '}
                      {insurance.isFlightDelayed.toString()}
                    </div>
                    <div>
                      <span>data de registro:</span>{' '}
                      {insurance.timestamp.toString()}
                    </div>
                    {Date.now() + 3600 > insurance.departureDate.toNumber() &&
                    !isAnalyzed ? (
                      <div className="buttonContractWrapper">
                        <button
                          className="buttonContract"
                          onClick={() => askForPayout()}
                        >
                          solicitar análise 🔬
                        </button>
                      </div>
                    ) : (
                      <p className="activeContract">contrato ativo</p>
                    )}
                  </div>
                )
              }
            })}
            {!allInsurances.some(
              (insurance) => insurance.address.toLowerCase() === currentAccount
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
