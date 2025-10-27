import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import {User, Stor} from "../../types";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = { tmzonDiv: string; totalAmt: number, billCnt: number };
type ListItem = {
    type: "summaryTotals";
    key: string;
    label: string;
    totalAmt: number;
    billCnt: number
};


export default function SalesReportByTimezoneScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [storList, setStorList] = useState<Stor[]>([]);
    const [selectedStorCd, setSelectedStorCd] = useState<string | null>(null);
    const [showStorModal, setShowStorModal] = useState(false);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const {user}:User = useUser();
    const [loading, setLoading] = useState(false);

    useEffect(()=> {
        getStorList();
    },[]);

    const getStorList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operType: Const.OPER_TYPE_REST,
            salesOrgCd: user.salesOrgCd,
            storeValue: ""
        }
        console.log("request:"+JSON.stringify(request))
        api.getStorList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const storList = result.data.responseBody;
                    setStorList([{storCd:'', storNm: '전체'}, ...storList]);
                }
            })
            .catch(error => {
                console.log("getStorList error:" + error)
            });
    }

    const onSearch = () => {
        //20250905, 20250925
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd:selectedStorCd,
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request))
        setLoading(true);

        api.restStorTimeZoneSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('size:'+saleList.length);
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("restStorTimeZoneSale error:" + error)
            })
            .finally(() => setLoading(false));
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'tmzonDiv', title: '시간대', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[{textAlign:'center'}, commonStyles.cell]}>{item.tmzonDiv}시</Text>
            )
        },
        {
            key: 'totalAmt', title: '판매금액', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.actualSaleAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'billCnt', title: '영수건수', flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.billCnt.toLocaleString()}</Text>
            )
        },
    ]), [])


    // 3행 요약 데이터 구성
    const summaryRows = useMemo(() => {
        if (!saleList || saleList.length === 0) return [];

        const timeGroups = {
            dawn: ["01", "02", "03", "04", "05", "06"],       // 새벽
            morning: ["07", "08", "09", "10", "11", "12"],    // 오전
            afternoon: ["13", "14", "15", "16", "17", "18"],  // 오후
            night: ["19", "20", "21", "22", "23", "24"],      // 저녁
        };

        // ✅ 특정 구간 totalAmt 합산 함수
        const sumByGroup = (group: string[]) =>
            saleList
                .filter((row) => group.includes(String(row.tmzonDiv).padStart(2, "0")))
                .reduce(
                    (acc, row) => {
                        acc.billCnt += row.billCnt ?? 0;
                        acc.totalAmt += row.actualSaleAmt ?? 0;
                        return acc;
                    },
                    { billCnt: 0, totalAmt: 0 }
                );

        const dawnTotals = sumByGroup(timeGroups.dawn);
        const morningTotals = sumByGroup(timeGroups.morning);
        const afternoonTotals = sumByGroup(timeGroups.afternoon);
        const nightTotals = sumByGroup(timeGroups.night);

        const row1: ListItem = {
            type: 'summaryTotals',
            key: 'time-dawn',
            label: '새벽\n[01시-06시]',
            totalAmt: dawnTotals.totalAmt,
            billCnt: dawnTotals.billCnt
        };
        const row2: ListItem = {
            type: 'summaryTotals',
            key: 'time-morning',
            label: '오전\n[07시-12시]',
            totalAmt: morningTotals.totalAmt,
            billCnt: morningTotals.billCnt
        };
        const row3: ListItem = {
            type: 'summaryTotals',
            key: 'time-afternoon',
            label: '오후\n[13시-18시]',
            totalAmt: afternoonTotals.totalAmt,
            billCnt: afternoonTotals.billCnt
        };
        const row4: ListItem = {
            type: 'summaryTotals',
            key: 'time-night',
            label: '저녁\n[19시-24시]',
            totalAmt: nightTotals.totalAmt,
            billCnt: nightTotals.billCnt
        };
        return [row1, row2, row3, row4];
    }, [saleList]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>포스그룹</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowStorModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{storList.find(g => g.storCd === selectedStorCd)?.storNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>
            <Table
                data={saleList}
                columns={mainColumns}
                listHeader={() => (
                    <View>
                        {summaryRows.map(row => (
                            <View key={row.key} style={commonStyles.summaryRow}>
                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={[styles.cell, styles.summaryLabelText, {textAlign: 'center'}]}>
                                        {row.label}
                                    </Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={commonStyles.numberCell}>{row.totalAmt.toLocaleString()}</Text>
                                </View>
                                <View style={[{flex: 0.5}, commonStyles.columnContainer]}>
                                    <Text style={commonStyles.numberCell}>{row.billCnt.toLocaleString()}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />
            <ListModal
                visible={showStorModal}
                title="포스그룹 선택"
                data={storList}
                keyField="storCd"
                labelField="storNm"
                onClose={() => setShowStorModal(false)}
                onSelect={(item) => {
                    setSelectedStorCd(item.storCd);
                    setShowStorModal(false);
                }}
            />
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    summaryLabelText: {fontWeight: '600', fontSize: 12, color: '#333'},
    cell: {fontSize: 13, color: '#444'},
});


