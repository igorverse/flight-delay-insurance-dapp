import axios from 'axios'

const api = axios.create({
  baseURL:
    'http://fakeflightoracleapi-env.eba-2rytjkbu.us-east-1.elasticbeanstalk.com/flights',
})

export default api
