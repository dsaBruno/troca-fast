import axios from 'axios';

export const vtexApiPayment = axios.create({
  baseURL: 'https://lojasantoantonio.vtexpayments.com.br/api',
  headers: {
    'Content-Type': 'application/json',
    'X-VTEX-API-AppKey': 'vtexappkey-lojasantoantonio-FFVILJ',
    'X-VTEX-API-AppToken':
      'BZOQJYZBAULSJLXGYVTOXASQPSQSBOQARPKJZIJFYDKBBFIHTVJBYHPFCQNDDVFSWLTZZZYNHSVMTQVHZDQRPNVIQVTNRJFYTHOBJMWPNNFCXRVBKTYQUXVVEMFUBBDX',
  },
});

export const vtexApi = axios.create({
  baseURL: 'https://lojasantoantonio.vtexcommercestable.com.br/api',
  headers: {
    'Content-Type': 'application/json',
    'X-VTEX-API-AppKey': 'vtexappkey-lojasantoantonio-FFVILJ',
    'X-VTEX-API-AppToken':
      'BZOQJYZBAULSJLXGYVTOXASQPSQSBOQARPKJZIJFYDKBBFIHTVJBYHPFCQNDDVFSWLTZZZYNHSVMTQVHZDQRPNVIQVTNRJFYTHOBJMWPNNFCXRVBKTYQUXVVEMFUBBDX',
  },
});
