import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd, ymdToDateWithDayShort} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {User, SalesOrg, Stor} from "../../types";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";

type SaleRow = {
    storNm: string;
    totalAmt: number;
    cashAmt: number;
    cardEtcAmt: number;
};
type SaleDetailRow = {
    saleDt: string;
    totalAmt: number;
    cashAmt: number;
    cardEtcAmt: number;
};
export default function MobileOrderReportByPeriod() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [storList, setStorList] = useState<Stor[]>([]);

    const [selectedStor, setSelectedStor] = useState<Stor | null>(null);
    const [showStorModal, setShowStorModal] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string | null>('');
    const [selectedStorCd, setSelectedStorCd] = useState<string>('');

    useEffect(() => {
        getSalesOrgList();
    },[]);

    useEffect(() => {
        getStorList();
    },[selectedSalesOrgCd]);

    const getSalesOrgList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operDiv: Const.OPER_TYPE_REST
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

    const getStorList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operType: Const.OPER_TYPE_REST,
            salesOrgCd: selectedSalesOrgCd,
            storeValue: ""
        }
        console.log("request:"+JSON.stringify(request))
        api.getStorList(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result))
                if (result.data.responseBody != null) {
                    const storList = result.data.responseBody;
                    console.log('storList:' + JSON.stringify(storList))
                    setStorList([
                            {storCd:'', storNm: '전체'},
                            ...storList
                        ]
                    );
                }
            })
            .catch(error => {
                console.log("getStorList error:" + error)
            });
    }

    const onSearch = () => {
        if(selectedSalesOrgCd=='') {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }
    };

    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 9}).map((_, idx) => {
                return {
                    storNm: `사업장${idx + 1}`,
                    totalAmt: idx * 10000,
                    cashAmt: idx * 10000,
                    cardEtcAmt: idx * 10000,
                };
            }), []
    );

    const detailData: SaleDetailRow[] = useMemo(
        () =>
            Array.from({length: 9}).map((_, idx) => {
                return {
                    saleDt: `2025090${idx + 1}`,
                    totalAmt: idx * 10000,
                    cashAmt: idx * 10000,
                    cardEtcAmt: idx * 10000,
                };
            }), []
    );

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'storNm', title: '매장그룹', flex: 1.5, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable}
                           onPress={() => {
                               // opensalesOrgNmDetail(item.storNm)
                               openDetail(item)
                           }}
                >
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.storNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'totalAmt', title: '총매출', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'cashAmt', title: Const.CASH, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.cashAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'cardEtcAmt', title: '카드/선불', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.cardEtcAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const detailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {
            key: 'saleDt', title: '매출일', flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'center'}]}>
                    {ymdToDateWithDayShort(item.saleDt)}
                </Text>
            ),
        },
        {
            key: 'totalAmt', title: '총매출', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'cashAmt', title: Const.CASH, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.cashAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'cardEtcAmt', title: '카드/선불', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.cardEtcAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const totalAmount = useMemo(() => baseData.reduce((acc, r) => acc + r.totalAmt, 0), [baseData]);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, styles.summaryLabelText,
                    {textAlign: 'center'}]}>전체 합계</Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const renderDetailFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, styles.summaryLabelText,
                    {textAlign: 'center'}]}>전체 합계</Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const openDetail = (stor: Stor) => {
        console.log("openDetail stor:"+stor)
        setSelectedStor(stor);
        setIsDetailVisible(true);
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회기간</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={commonStyles.selectText}>{formattedDate(fromSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={commonStyles.selectText}>{formattedDate(toSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장그룹</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowStorModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {storList.find(g => g.storCd === selectedStorCd)?.storNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>
            <Table
                data={baseData}
                columns={mainColumns}
                listFooter={renderFooter}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromSaleDt(dateToYmd(date));
                    else setToSaleDt(dateToYmd(date));
                }}
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

            <ListModal
                visible={showStorModal}
                title="매장그룹 선택"
                data={storList}
                keyField="storCd"
                labelField="storNm"
                onClose={() => setShowStorModal(false)}
                onSelect={(item) => {
                    setSelectedStorCd(item.storCd);
                    setShowStorModal(false);
                }}
            />

            <Modal visible={isDetailVisible}
                   transparent animationType="fade"
                   onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {selectedStor && (
                                <Text style={commonStyles.modalTitle}>{selectedStor?.storNm}</Text>
                            )}
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={detailData}
                            columns={detailColumns}
                            isModal={true}
                            listFooter={renderDetailFooter}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    summaryLabelText: {
        fontWeight: '600',
        fontSize: 12,
        color: '#333'
    },
});
