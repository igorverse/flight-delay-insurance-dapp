import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './utils/InsuranceProvider.json'
import api from './services/api'
import FlightCard from './components/FlightCard'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [flightNumer, setFlightNumber] = useState('')
  const [notFoundFlight, setNotFoundFlight] = useState(false)
  const [flight, setFlight] = useState()
  const [allInsurances, setAllInsurances] = useState([])
  const [isFill, setIsFill] = useState(false)

  const contractAddress = '0xC27d44B877E431EdCaaFE277b5BcB482B13522B3'

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
      setIsFill(true)
    } else {
      setIsFill(false)
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
    } catch (error) {
      console.log(error)
    }
  }

  const askForInsurance = async () => {
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

        let count = await verxusInsuranceContract.getTotalInsurances()
        console.log('Retrivied total insurance count...', count.toNumber())

        const insuranceTxn = await verxusInsuranceContract.insurance(
          'ada',
          42,
          100,
          1000,
          1654889400,
          false
        )
        console.log('Mining...', insuranceTxn.hash)

        await insuranceTxn.wait()
        console.log('Mined --', insuranceTxn.hash)

        count = await verxusInsuranceContract.getTotalInsurances()

        getAllInsurances()

        console.log('Retrieved total insurance count...', count.toNumber())
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
        setAllInsurances(insurancesCleaned)
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
          <p className="disconnected">• Carteira Desconectada</p>
        )}
      </div>
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">✈️ Proteja-se contra voos cancelados!</div>

          <div className="bio">
            Contrate seu seguro paramétrico por meio de{' '}
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
                    value={flightNumer}
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
                      if (isFill) {
                        getFlightInformation(flightNumer)
                        setIsFill(false)
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
              <div className="buttonInsuranceWrapper">
                <button
                  className="buttons back"
                  onClick={() => {
                    setFlight(null)
                    setFlightNumber(null)
                  }}
                >
                  Voltar
                </button>
                <button className="buttonInsurance" onClick={askForInsurance}>
                  Solicitar Seguro 🚀
                </button>
              </div>
            </div>
          )}

          {allInsurances.map((insurance, index) => {
            if (insurance.address.toLowerCase() === currentAccount) {
              return (
                <div key={index}>
                  <div>airlineCompany: {insurance.airlineCompany}</div>
                  <div>flightNumber: {insurance.flightNumber.toNumber()}</div>
                  <div>premium: {insurance.premium.toNumber()}</div>
                  <div>payout: {insurance.payout.toNumber()}</div>
                  <div>departureDate: {insurance.departureDate.toNumber()}</div>
                  <div>isFlightDelayed: {insurance.isFlightDelayed}</div>
                  <div>Time: {insurance.timestamp.toString()}</div>
                </div>
              )
            }
          })}
        </div>
      </div>
    </div>
  )
}

export default App
