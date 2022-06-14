import React from 'react'
import './FlightCard.css'
import { convertDateFormat } from '../utils/utils'

const FlightCard = (props) => (
  <div className="flightInformation">
    <p>
      companhia aérea: <span>{props?.airlinecompany}</span>
    </p>
    <p>
      número de voo: <span>{props?.flightnumber}</span>
    </p>
    <p>
      data do voo: <span>{convertDateFormat(props?.departuredate)}</span>
    </p>
    <p>
      prêmio do seguro: <span>{props?.premium}</span>
    </p>
    <p>
      recompensa do seguro: <span>{props?.payout}</span>
    </p>
  </div>
)

export default FlightCard
