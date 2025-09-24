import axios from 'axios';

// export const host = "https://o2api.spc.co.kr";
export const host = "https://s9rest.ngrok.io";

const api = axios.create({ baseURL: host });

let authToken: string | null = null;
api.interceptors.request.use((config) => {
    if (authToken) {
        // console.log("Using authToken:", authToken);
        config.headers.Authorization = authToken;
    }
    return config;
});
export function setAuthToken(token: string) {
    console.log('Set Token:', token);
    authToken = token;
}

export function post(request: string, body: any) {
    return api.post(request, body);
}

export function get(request: string, body: any) {
    return axios.get(request, {
        params: body,
    });
}

export function login(userId, password) {
    const request = host + '/api/v1/login/';
    const body = {
        userId: userId,
        password: password
    };
    return post(request, body);
}

export function restDailySale(params) {
    const request = host + "/api/v1/rest/sale/restDailySale";
    return post(request, params);
}

export function restMonthlyCornerSale(params) {
    const request = host + "/api/v1/rest/sale/restMonthlyCornerSale";
    return post(request, params);
}


export function restMonthlySale(params) {
    const request = host + "/api/v1/rest/sale/restMonthlySale";
    return post(request, params);
}
