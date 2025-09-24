import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd, ymdToDateWithDayShort} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type Stor = {
    storCd: string;
    storNm: string
};

type SalesOrg = { salesOrgCd: string; salesOrgNm: string };
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
    const salesOrgList: SalesOrg[] = useMemo(
        () => [
            {salesOrgCd: '', salesOrgNm: '선택'},
            ...Array.from({length: 6}).map((_, i) => ({
                salesOrgCd: `G${i + 1}`,
                salesOrgNm: `그룹 ${i + 1}`
            })),
        ],
        []
    );
    const storList: Stor[] = useMemo(
        () => Array.from({length: 6}).map((_, i) => ({storCd: `G${i + 1}`, storNm: `그룹 ${i + 1}`})),
        []
    );
    const [selectedSalesOrg, setSelectedSalesOrg] = useState<string | null>(salesOrgList[0]?.salesOrgCd ?? null);
    const [selectedStor, setSelectedStor] = useState<Stor | null>(null);
    const [showStorModal, setShowStorModal] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);


    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };
    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
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
                        <Text style={styles.selectText}>{formattedDate(fromSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={styles.selectText}>{formattedDate(toSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowStorModal(true)}>
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrg)?.salesOrgCd || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>매장그룹</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowStorModal(true)}>
                        <Text style={styles.selectText}>
                            {storList.find(g => g.storCd === selectedStor)?.storCd || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>구분</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowStorModal(true)}>
                        <Text
                            style={styles.selectText}>{storList.find(g => g.storCd === selectedStor)?.storCd || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
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

            <Modal visible={showStorModal} transparent animationType="slide"
                   onRequestClose={() => setShowStorModal(false)}>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <View style={commonStyles.listModalHeader}>
                            <Text style={commonStyles.modalTitle}>매장그룹 선택</Text>
                            <TouchableOpacity onPress={() => setShowStorModal(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={storList}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={commonStyles.modalItem}
                                    onPress={() => {
                                        setSelectedStor(item.id);
                                        setShowStorModal(false);
                                    }}
                                >
                                    <Text style={commonStyles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

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
    selectText: {
        fontSize: 14, color: '#333'
    },
    summaryLabelText: {
        fontWeight: '600',
        fontSize: 12,
        color: '#333'
    },
    cell: {
        fontSize: 13,
        color: '#444'
    },
});
