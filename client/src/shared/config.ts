import {io} from 'socket.io-client'
export const BASE_URL= 'http://localhost:3000';
export const socket = io(BASE_URL);