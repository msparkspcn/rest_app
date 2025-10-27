import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import * as api from "../../services/api/api";
import {useUser} from "../../contexts/UserContext";
import {User} from "../../types/user";
import LoadingOverlay from "../../components/LoadingOverlay";
import {AntDesign} from "@expo/vector-icons";

type SaleRow = {
    no: number;
    orgNm: string;
    storCd: string;
    gaugeNm: string;
    saleQty: number;
    actualSaleAmt: number;
    totalSaleAmt: number;
    isFirstRow: boolean;
};

type StoreGroup = { id: string; name: string };

export default function RealtimeSalesScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const storeGroups: StoreGroup[] = useMemo(
        () => [
            {id: "", name: "전체"},
            {id: "01", name: "주유소"},
            {id: "02", name: "충전소"}
        ],
        []
    );

    const [selectedStorCd, setSelectedStorCd] = useState<StoreGroup>(storeGroups[0]);
    const [saleList, setSaleList] = useState<SaleRow[]>([]);
    const [saleStatList ,setSaleStatList] = useState<[] | null>([]);
    const {user}:User = useUser();
    const [loading, setLoading] = useState(false);

    const onSearch = () => {
        console.log("조회 클릭 fromSaleDt")

        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: selectedStorCd.id,
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);
        api.mobOilRealTimeSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList));
                    setSaleList(saleList);
                    if(saleList.length > 0) {
                        mobOilRealTimeSaleStat();
                    }
                    else {
                        setLoading(false);
                    }
                }
            })
            .catch(error => {
                setLoading(false);
                console.log("mobOilRealTimeSale error:" + error)
            });
    };

    const mobOilRealTimeSaleStat = () => {
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: selectedStorCd.id,
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        api.mobOilRealTimeSaleStat(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleStatList = result.data.responseBody;
                    console.log('saleStatList:' + JSON.stringify(saleStatList))
                    setSaleStatList(saleStatList);
                }
            })
            .catch(error => {
                console.log("mobOilRealTimeSaleStat error:" + error)
            }).finally(() => setLoading(false));
    }

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {
            key: 'storNm', title: '매장', flex: 0.8,
            renderCell: (item) => {
                if(!item.isFirstRow) return null;
                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                        {item.storNm}
                    </Text>
                )
            },
        },
        {
            key: 'gaugeNm', title: '게이지', flex: 1.2,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.gaugeNm}
                </Text>
            )
        },
        {
            key: 'saleQty', title: '판매수량', flex: 1.1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.saleQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '총매출', flex: 1.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    const tableData = useMemo(() => {
        const result: (SaleRow & { isSummary?: boolean })[] = [];

        const grouped: Record<string, SaleRow[]> = {};
        saleList.forEach(item => {
            if (!grouped[item.storCd]) grouped[item.storCd] = [];
            grouped[item.storCd].push(item);
        });

        let no = 0;
        let sumNo = 0;
        Object.keys(grouped)
            .sort() // 날짜 오름차순
            .forEach(storCd => {
                const rows = grouped[storCd];
                let dateSum = 0;
                let saleQtySum = 0;
                rows.forEach((item, idx) => {
                    dateSum += item.actualSaleAmt;
                    saleQtySum += item.saleQty;
                    no += 1;
                    result.push({
                        ...item,
                        no: no,
                        isFirstRow: idx === 0 ? true : false
                    });
                });

                if(selectedStorCd.id=="") {
                    let summaryName = '';
                    if (storCd === '01') summaryName = Const.OIL_SUMMARY;
                    else if (storCd === '02') summaryName = Const.GAS_SUMMARY;
                    sumNo -= 1;
                    result.push({
                        no: sumNo,
                        orgNm: summaryName,
                        storCd: '',
                        gaugeNm: '',
                        actualSaleAmt: dateSum,
                        totalSaleAmt: dateSum,
                        saleQty:saleQtySum,
                        isSummary: true,
                        isFirstRow: false
                    });
                }
            });
        console.log("result11:"+JSON.stringify(result));

        return result;
    }, [saleStatList]);

    const renderListHeader = () => {
        if (saleList.length == 0) return null;
        return (
            <View>
                {saleStatList.map(row => (
                    <View
                        key={row.sortOrder}
                        style={commonStyles.summaryRow}>
                        {row.sortOrder === '1' && (
                                <>
                                    <View style={[{flex: 1.3}, commonStyles.columnContainer]}>
                                        <Text style={[commonStyles.cell, commonStyles.summaryLabelText, {textAlign:'center'}]}>
                                            {row.label}
                                        </Text>
                                    </View>
                                    <View style={[{flex: 3.8}, commonStyles.columnContainer]}>
                                        <Text style={[commonStyles.numberSmallCell]}>
                                            {row.saleQty.toLocaleString()} / {row.saleAmt.toLocaleString()}
                                        </Text>
                                    </View>
                                </>
                        )}
                        {row.sortOrder === '2' && (
                            <View style={[{flex: 1.3, flexDirection: 'row', alignItems: 'center'}, commonStyles.columnContainer]}>
                                <View style={[{flex: 1.3}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, {textAlign:'center'}]}>
                                        전주/전일 매출
                                    </Text>
                                </View>
                                <View style={[{flex: 3.8, flexDirection:'row',borderWidth: StyleSheet.hairlineWidth,
                                    borderColor: '#aaa', height: '100%', alignItems:'center', justifyContent:'flex-end',
                                    marginRight:-1}]}>
                                    <Text style={{fontSize: 12, color: '#444'}}>
                                        {row.saleQty.toLocaleString()}
                                    </Text>
                                    <AntDesign
                                        name={row.saleQty > 0 ? 'caretup' : 'caretdown'}
                                        size={13}
                                        color={row.saleQty > 0 ? 'red' : 'blue'}
                                        style={{paddingHorizontal: 5}}
                                    />
                                    <Text style={{fontSize: 12, color: '#444'}}> /  {row.saleAmt.toLocaleString()}
                                    </Text>
                                    <AntDesign
                                        name={row.saleQty > 0 ? 'caretup' : 'caretdown'}
                                        size={13}
                                        color={row.saleQty > 0 ? 'red' : 'blue'}
                                        style={{paddingHorizontal: 5}}
                                    />
                                </View>
                            </View>
                        )}
                        {row.sortOrder != '1' && row.sortOrder !='2' && (
                            <>
                                <View style={[{flex: 1.3,paddingLeft:0.5}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, {textAlign:'center'}]}>
                                        {row.label}
                                    </Text>
                                </View>
                                <View style={[{flex: 2.3}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.numberSmallCell]}>
                                        {row.saleQty.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{flex: 1.5}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.numberSmallCell]}>
                                        {row.saleAmt.toLocaleString()}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                ))}
            </View>
        )
    };

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={[commonStyles.filterRowFront]}>
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
                data={tableData}
                columns={mainColumns}
                listHeader={renderListHeader}
            />

            {loading && (<LoadingOverlay />)}

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />
        </SafeAreaView>
    );
}
