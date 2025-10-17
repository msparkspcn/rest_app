import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import * as api from "../../services/api/api";
import {useUser} from "../../contexts/UserContext";
import {User, SalesOrg} from "../../types";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    storNm: string;
    storCd: string;
    gaugeNm: string;
    saleQty: number;
    actualSaleAmt: number
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

    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const [saleStatList ,setSaleStatList] = useState<[] | null>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    },[]);

    const getSalesOrgList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operType: '',
            restValue: '',
        }
        console.log("request:"+JSON.stringify(request))
        api.getSalsOrgList(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result))
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    console.log('salesOrgList:' + JSON.stringify(salesOrgList))
                    setSalesOrgList(salesOrgList);
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    }


    const onSearch = () => {
        if(selectedSalesOrgCd=='') {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }
        console.log("조회 클릭")

        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: selectedStorCd.id,
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);
        api.mobOilRealTimeSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    mobOilRealTimeSaleStat();
                }
            })
            .catch(error => {
                console.log("mobOilRealTimeSale error:" + error)
            });
    };

    const mobOilRealTimeSaleStat = () => {
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
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
                    setLoading(false);
                }
            })
            .catch(error => {
                console.log("mobOilRealTimeSaleStat error:" + error)
            });
    }

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.4,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {
            key: 'storNm', title: '매장', flex: 0.8,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.storNm}
                </Text>
            ),
        },
        {
            key: 'gaugeNm', title: '게이지', flex: 0.8,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.gaugeNm}
                </Text>
            )
        },
        {
            key: 'saleQty', title: '판매수량', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.saleQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '총매출', flex: 1.2,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity
                        style={commonStyles.selectInput}
                        onPress={() => setShowSalesOrgListModal(true)}
                    >
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
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
                listHeader={() => (
                    <View>
                        {saleStatList.map(row => (
                            <View
                                key={row.sortOrder}
                                style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                                {row.sortOrder === '1' || row.sortOrder === '2' ? (
                                    <>
                                        <View style={[{flex: 1.2}, commonStyles.tableRightBorder]}>
                                            <Text style={[commonStyles.cell, styles.summaryLabelText, {textAlign:'center'}]}>
                                                {row.label}
                                            </Text>
                                        </View>
                                        <View style={[{flex: 3}, commonStyles.tableRightBorder]}>
                                            <Text style={[commonStyles.numberSmallCell]}>
                                                {row.saleQty.toLocaleString()} / {row.saleAmt.toLocaleString()}
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <View style={[{flex: 1.2}, commonStyles.tableRightBorder]}>
                                            <Text style={[commonStyles.cell, styles.summaryLabelText, {textAlign:'center'}]}>
                                                {row.label}
                                            </Text>
                                        </View>
                                        <View style={[{flex: 1.8}, commonStyles.tableRightBorder]}>
                                            <Text style={[commonStyles.numberSmallCell]}>
                                                {row.saleQty.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={[{flex: 1.2}, commonStyles.tableRightBorder]}>
                                            <Text style={[commonStyles.numberSmallCell]}>
                                                {row.saleAmt.toLocaleString()}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            />

            {loading && (<LoadingOverlay />)}

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />

            <ListModal
                visible={showSalesOrgListModal}
                title="사업장 선택"
                data={salesOrgList}
                keyField="salesOrgCd"
                labelField="salesOrgNm"
                onClose={() => setShowSalesOrgListModal(false)}
                onSelect={(item) => {
                    setSelectedSalesOrgCd(item.salesOrgCd);
                    setShowSalesOrgListModal(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
    summaryLabelText: {fontWeight: '700', color: '#333'}
});
