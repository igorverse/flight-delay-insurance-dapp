import axios from 'axios'

const api = axios.create({
  baseURL:
    'http://fake-flight-oracle-api.us-east-1.elasticbeanstalk.com/flights',
})

export default api
