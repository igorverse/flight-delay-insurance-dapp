import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from './utils/WavePortal.json'
import api from './services/api'
import FlightCard from './components/FlightCard'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('')
  const [flightNumer, setFlightNumber] = useState('')
  const [notFoundFlight, setNotFoundFlight] = useState(false)
  const [flight, setFlight] = useState()

  const contractAddress = '0x87A6D7Cc5136dd981535830D2DCdc07323de0082'

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

    console.log('value is: ', event.target.value)
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

  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrivied total wave count...', count.toNumber())

        const waveTxn = await wavePortalContract.wave()
        console.log('Mining...', waveTxn.hash)

        await waveTxn.wait()
        console.log('Mined --', waveTxn.hash)

        count = await wavePortalContract.getTotalWaves()

        console.log('Retrieved total wave count...', count.toNumber())
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    console.log(flightNumer)
  }, [])

  return (
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
                  onClick={() => getFlightInformation(flightNumer)}
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
              <button className="buttonInsurance">Solicitar Seguro 🚀</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
