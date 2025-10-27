import axios from 'axios';

// export const host = "https://o2api.spc.co.kr";
export const host = "https://s9rest.ngrok.io";
// export const host = "http://10.212.44.112:8081";

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

export function put(request: string, body: any) {
    return axios.put(request, body);
}

export function login(userId, password) {
    const request = host + '/api/v1/login/';
    const body = {
        userId: userId,
        password: password
    };
    return post(request, body);
}

export function updateUser(params) {
    const request = host + '/api/v1/user';

    return put(request, params);
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

export function getKioskItemList(params) { // 휴게소 키오스크품절관리(휴) 조회
    const request = host + "/api/v1/did/item";
    return post(request, params);
}

export function updateSoldoutYn(params) {
    const request = host + "/api/v1/item/soldout";
    return post(request, params);
}

export function getPurchaseSummary(params) {
    const request = host + "/api/v1/purchase/vendor/summary"; // (모바일)거래처별 총매입금액 조회
    return post(request, params);
}

export function getPurchaseItem(params) {
    const request = host + "/api/v1/purchase/vendor/items"; // (모바일)상품별 매입현황 조회
    return post(request, params);
}

export function getPurchaseListByItem(params) {
    const request = host + "/api/v1/purchase/item/summary"; // 휴게소 상품별 매입현황(휴)
    return post(request, params);
}

export function getPurchaseDetailListByItem(params) {
    const request = host + "/api/v1/purchase/item/detail"; // 휴게소 상품별 매입현황(휴) > 상세
    return post(request, params);
}

export function getPurchaseSummaryOp(params) {
    const request = host + "/api/v1/purchase/salesorg/summary"; // 운영업체 일자별 매입현황(통합)
    return post(request, params);
}

export function restDailySale(params) {
    const request = host + "/api/v1/rest/sale/restDailySale";
    return post(request, params);
}

export function mobRestRealTimeSaleStat(params) {
    const request = host + "/api/v1/rest/sale/mobRestRealTimeSaleStat";
    return post(request, params);
}

export function mobRestRealTimeSaleResult(params) { // 휴게소 실시간 매출현황(휴) > 상단실적
    const request = host + "/api/v1/rest/sale/mobRestRealTimeSaleResult";
    return post(request, params);
}

export function restStorTimeZoneSale(params) { //시간대별 매출현황(휴)
    const request = host + "/api/v1/rest/sale/restStorTimeZoneSale";
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

export function mobRestSaleAnalysis(params) { //시설별 매출현황(휴)
    const request = host + "/api/v1/rest/sale/mobRestSaleAnalysis";
    return post(request, params);
}

export function mobRestItemSaleAnalysis(params) { //시설별 매출현황 > 상세
    const request = host + "/api/v1/rest/sale/mobRestItemSaleAnalysis";
    return post(request, params);
}

export function mobRestRealTimeSaleNews(params) { //실시간 매장매출현황(휴)
    const request = host + "/api/v1/rest/sale/mobRestRealTimeSaleNews";
    return post(request, params);
}

export function mobRestRealTimeItemSale(params) { //실시간 매장매출현황(휴)
    const request = host + "/api/v1/rest/sale/mobRestRealTimeItemSale";
    return post(request, params);
}

export function mobRestRealTimeSaleDetail(params) { //실시간 매장매출현황(휴) 상세
    const request = host + "/api/v1/rest/sale/mobRestRealTimeSaleDetail";
    return post(request, params);
}

export function restCornerByDailySale(params) { //월 매출현황(휴) > 매장명 클릭 => 일자별 매출현황
    const request = host + "/api/v1/rest/sale/restCornerByDailySale";
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

export function restCornerByItemSale(params) { //기간별 매출현황 > 매장명 클릭
    const request = host + "/api/v1/rest/sale/restCornerByItemSale";
    return post(request, params);
}

export function mobOilRealTimeSale(params) { //주유소/운영업체 실시간 매출현황(주)
    const request = host + "/api/v1/oil/sale/mobOilRealTimeSale";
    return post(request, params);
}

export function mobOilRealTimeSaleStat(params) { //주유소/운영업체 실시간 매출현황(주) > 상세
    const request = host + "/api/v1/oil/sale/mobOilRealTimeSaleStat";
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

export function mobOilDailyItemSale(params) { //주유소 기간별 매출현황 > 상세
    const request = host + "/api/v1/oil/sale/mobOilDailyItemSale";
    return post(request, params);
}

export function mobOilSaleAnalysis(params) { //주유소 시설별 실시간 매출(통합)
    const request = host + "/api/v1/oil/sale/mobOilSaleAnalysis";
    return post(request, params);
}

export function oilTotalStockStatusList(params) {
    const request = host + "/api/v1/oilstock/oilTotalStockStatusList";
    return post(request, params);
}

export function mobOilPeriodStock(params) {   //재고현황(주)
    const request = host + "/api/v1/oilstock/mobOilPeriodStock";
    return post(request, params);
}

export function mobOilDailyItemStock(params) {   //재고현황(주) > 상세
    const request = host + "/api/v1/oilstock/mobOilDailyItemStock";
    return post(request, params);
}

export function mobOilRealTimeStock(params) {   //실시간 재고현황(주)
    const request = host + "/api/v1/oilstock/mobOilRealTimeStock";
    return post(request, params);
}

export function restCornerStockList(params) { //휴게소 매장 재고현황(휴)
    const request = host + "/api/v1/stock/status/daily/list";
    return post(request, params);
}

export function getItemClassList(params) { //휴게소 창고 재고현황(휴)
    const request = host + "/api/v1/item-class/list";
    return post(request, params);
}

export function restWarehouseStockList(params) { //휴게소 창고 재고현황(휴)
    const request = host + "/api/v1/stock/status/warehouse/list2";
    return post(request, params);
}

export function restWarehouseStockList2(params) { //휴게소 창고 재고현황(휴) > 상세
    const request = host + "/api/v1/stock/status/item/daily/list";
    return post(request, params);
}

export function mobOperRealTimeSale(params) { //운영업체 실시간 매출현황(통합)
    const request = host + "/api/v1/oper/sale/mobOperRealTimeSale";
    return post(request, params);
}

export function mobOperRealTimeSaleStat(params) { //운영업체 실시간 매출현황(통합) > 실적
    const request = host + "/api/v1/oper/sale/mobOperRealTimeSaleStat";
    return post(request, params);
}

export function mobOperPeriodSale(params) { //운영업체 기간별 매출현황(통합)
    const request = host + "/api/v1/oper/sale/mobOperPeriodSale";
    return post(request, params);
}

export function mobOperSaleDetail(params) { //운영업체 기간별 매출현황(통합) > 상세
    const request = host + "/api/v1/oper/sale/mobOperSaleDetail";
    return post(request, params);
}

export function mobOperTmzonSale(params) { //운영업체 시간대별 매출현황(통합)
    const request = host + "/api/v1/oper/sale/mobOperTmzonSale";
    return post(request, params);
}

export function mobOperRealTimeSaleRatio(params) { //운영업체 시간대별 매출현황(통합)
    const request = host + "/api/v1/oper/sale/mobOperRealTimeSaleRatio";
    return post(request, params);
}
