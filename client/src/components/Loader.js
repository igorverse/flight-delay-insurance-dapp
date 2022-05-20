import React from 'react'
import ReactLoading from 'react-loading'

const Loader = ({ type, color }) => (
  <ReactLoading
    className="loading"
    type="spokes"
    color="#bd93f9"
    width="48px"
    height="48px"
  />
)

export default Loader
