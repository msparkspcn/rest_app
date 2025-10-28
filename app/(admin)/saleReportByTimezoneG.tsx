import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerModal } from "../../components/DatePickerModal";
import { Table } from "../../components/Table";
import Const from "../../constants/Const";
import { commonStyles } from "../../styles/index";
import { ColumnDef } from "../../types/table";
import { dateToYmd, formattedDate, getTodayYmd } from "../../utils/DateUtils";
import * as api from "../../services/api/api";
import {User} from "../../types";
import {useUser} from "../../contexts/UserContext";
import LoadingOverlay from "../../components/LoadingOverlay";
type SaleRow = { tmzonDiv: string; saleAmt: number, billCnt: number };
type ListItem = {
    type: "summaryTotals";
    key: string;
    label: string;
    totalAmt: number;
    billCnt: number
};
type StoreGroup = { id: string; name: string };

export default function SalesReportByTimezoneScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const storeGroups: StoreGroup[] = useMemo(
        () => [
            // {id: "", name: "전체"},    //api에서 주유소,충전소별로 보여주므로 전체 조회 제거
            {id: "01", name: "주유소"},
            {id: "02", name: "충전소"}
        ],
        []
    );
    const [selectedStorCd, setSelectedStorCd] = useState<StoreGroup>(storeGroups[0]);
    const [saleList, setSaleList] = useState<SaleRow[]>([]);

    const {user}: User = useUser();
    const [loading, setLoading] = useState(false);

    const onSearch = () => {
        console.log('조회 클릭');

        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd,
            fromSaleDt: saleDate,
            toSaleDt: saleDate,
            storCd: selectedStorCd.id
        }
        console.log("request:"+JSON.stringify(request))
        setLoading(true);
        api.posGroupByOilHourlySale(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result.data))
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
                setLoading(false);
            })
            .catch(error => {
                console.log("posGroupByOilHourlySale error:" + error);
                setLoading(false);
            });
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'tmzonDiv', title: '시간대', flex: 0.8, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{item.tmzonDiv}시</Text>
            )
        },
        {
            key: 'saleAmt', title: '판매금액', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell]}>{item.saleAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'billCnt', title: '영수건수', flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.billCnt.toLocaleString()}</Text>
            )
        },
    ]), [])

    // 3행 요약 데이터 구성
    const summaryRows = useMemo(() => {
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
                        acc.billCnt += row.billCnt;
                        acc.totalAmt += row.saleAmt;
                        return acc;
                    },
                    {billCnt: 0, totalAmt: 0}
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

    const renderListHeader = () => {
        if (saleList.length == 0) return null;
        return (
            <View>
                {summaryRows.map(row => (
                    <View key={row.key} style={commonStyles.summaryRow}>
                        <View style={[{flex: 0.8}, commonStyles.columnContainer]}>
                            <Text style={styles.summaryLabelText}>{row.label}</Text>
                        </View>

                        <View style={[{flex: 1}, commonStyles.columnContainer]}>
                            <Text style={commonStyles.numberCell}>
                                {row.totalAmt.toLocaleString()}
                            </Text>
                        </View>

                        <View style={{ flex: 0.5 }}>
                            <Text style={commonStyles.numberCell}>
                                {row.billCnt.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
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
                    <Text style={commonStyles.filterLabel}>{Const.STORE_GROUP}</Text>
                    <View style={commonStyles.segmented}>
                        {storeGroups.map((option) => (
                            <Pressable
                                key={option.id}
                                onPress={() => setSelectedStorCd(option)}
                                style={[commonStyles.segmentItem, selectedStorCd.id === option.id && commonStyles.segmentItemActive]}
                            >
                                <Text
                                    style={[commonStyles.segmentText, selectedStorCd.id === option.id && commonStyles.segmentTextActive]}>
                                    {option.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>
            <Table
                data={saleList}
                columns={mainColumns}
                listHeader={renderListHeader}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    summaryLabelText: {
        fontWeight: '600',
        fontSize: 13,
        color: '#333',
        textAlign: 'center'
    },
});


