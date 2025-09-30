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

export function getCornerList(params) {
    const request = host + "/api/v1/corner/list";
    return post(request, params);
}

export function getStorList(params) {
    const request = host + "/api/v1/store/list";
    return post(request, params);
}

export function getSalsOrgList(params) {
    const request = host + "/api/v1/rest/list";
    return post(request, params);
}

export function getCornerHandleItems(params) {
    const request = host + "/api/v1/item/corner-handle-items";
    return post(request, params);
}

export function getVendorList(params) {
    const request = host + "/api/v1/vendor/list";
    return post(request, params);
}

export function getVendorItemList(params) {
    const request = host + "/api/v1/vendor/item/with-registration";
    return post(request, params);
}

export function restDailySale(params) {
    const request = host + "/api/v1/rest/sale/restDailySale";
    return post(request, params);
}

export function restMonthlyCornerSale(params) { //월 매출현황(휴)
    const request = host + "/api/v1/rest/sale/restMonthlyCornerSale";
    return post(request, params);
}


export function restMonthlySale(params) { //월 매출현황(휴)
    const request = host + "/api/v1/rest/sale/restMonthlySale";
    return post(request, params);
}

export function restTodayItemSale(params) {
    const request = host + "/api/v1/rest/sale/restTodayItemSale";
    return post(request, params);
}

export function restDailyCornerSale(params) { //기간별 매출현황
    const request = host + "/api/v1/rest/sale/restDailyCornerSale";
    return post(request, params);
}

export function posGroupByOilHourlySale(params) { //주유소 시간대별 매출현황
    const request = host + "/api/v1/oil/sale/posGroupByOilHourlySale";
    return post(request, params);
}

export function posGroupByOilDailySale(params) { //주유소 기간별 매출현황
    const request = host + "/api/v1/oil/sale/posGroupByOilDailySale";
    return post(request, params);
}
