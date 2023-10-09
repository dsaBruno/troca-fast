import axios from 'axios';

export const idWorksApi = axios.create({
  baseURL: 'https://lojasantoantonio.api.idworks.com.br/1.0/',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo1NTUsIkFjY291bnROYW1lIjpbImxvamFzYW50b2FudG9uaW8iLCJsb2phc2FudG9hbnRvbmlvXzA3IiwibG9qYXNhbnRvYW50b25pb18wN190ZWxldmVuZGFzIiwibG9qYXNhbnRvYW50b25pb18wOCIsImxvamFzYW50b2FudG9uaW9fdGVsZXZlbmRhcyJdLCJJRENvbXBhbnkiOlsiMTI2IiwiMTI5IiwiMTM5IiwiMTU2IiwiMTcxIl0sIlNhbGVzbWFuIjowLCJSZXN0cmljdEFjY2Vzc1NhbGVzbWFuIjowfSwiaWF0IjoxNjg0MTQ2NDcyLCJleHAiOjE4NTY5NDY0NzJ9.pkY2Du5TgqKwIBgUy5tGPblCWibBCCpqf0v4el2hTWE',
  },
});
