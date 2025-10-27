import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {Table} from "../../components/Table";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import LoadingOverlay from "../../components/LoadingOverlay";
import * as api from "../../services/api/api";
import {User} from "../../types/user";
import {useUser} from "../../contexts/UserContext";

type PurchaseRow = { date: string; outSdCmpNm: string; totalOrdAmt: number };
type PurchaseDetailRow = {
    itemNm: string,
    ordQty: number,
    ordPrc: number,
    ordAmt: number,
    ordDgre: number
};

export default function PurchaseDailyReportScreen() {
    const [fromPurchaseDt, setFromPurchaseDt] = useState(getTodayYmd());
    const [toPurchaseDt, setToPurchaseDt] = useState(getTodayYmd());
    const [vendorQuery, setVendorQuery] = useState('');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedVendorName, setSelectedVendorName] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [purchaseList, setPurchaseList] = useState<[] | null>(null);
    const [purchaseItemList, setPurchaseItemList] = useState<[] | null>(null);
    const {user}: User = useUser();

    const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {key: 'date', title: '일자', flex: 1.5, align: 'center',
            renderCell: (item) => {

                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                        {formattedDate(item.dlvDt)}
                    </Text>
                )
            },
        },
        {
            key: 'outSdCmpNm', title: '거래처', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable
                    style={commonStyles.columnPressable}
                    onPress={() => openVendorDetail(item)}
                >
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.outSdCmpNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'totalOrdAmt', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalOrdAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 2}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, commonStyles.summaryLabelText, {textAlign:'center'}]}>
                    합계
                </Text>
            </View>
            <View style={[{flex:3.5}, commonStyles.columnContainer]}>
                <Text style={commonStyles.summaryNumberCell}>
                    {totalOrdAmt.toLocaleString()}
                </Text>
            </View>
        </View>
    );


    const totalOrdAmt = useMemo(() => (purchaseList ?? []).reduce((acc, r) => acc + r.totalOrdAmt, 0), [purchaseList]);

    const onSearch = () => {
        console.log("조회 클릭");
        const request = {
            cmpCd: user.cmpCd,
            outSdCmpCd: vendorQuery,
            fromDate: fromPurchaseDt,
            salesOrgCd: user.salesOrgCd,
            toDate: toPurchaseDt
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);

        api.getPurchaseSummary(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const purchaseList = result.data.responseBody;
                    console.log('purchaseList:' + JSON.stringify(purchaseList))
                    setPurchaseList(purchaseList);
                }
            })
            .catch(error => {
                console.log("getPurchaseSummary error:" + error)
            }).finally(() => setLoading(false));
    };

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        {key: 'itemNm', title: '상품', flex: 2, align: 'left'},
        {key: 'ordDgre', title: '일련\n번호', flex: 1, align: 'left',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.ordDgre.toLocaleString()}</Text>
            )
        },
        {
            key: 'ordPrc', title: Const.PRICE, flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.ordPrc.toLocaleString()}</Text>
            )
        },
        {
            key: 'ordQty', title: Const.QTY, flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.ordQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'ordAmt', title: '금액', flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.ordAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderDetailFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 3}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, commonStyles.summaryLabelText]}>
                    합계
                </Text>
            </View>
            <View style={[{flex: 3}, commonStyles.columnContainer]}>
                <Text style={commonStyles.summaryNumberCell}>
                    {detailTotalQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 2}, commonStyles.columnContainer]}>
                <Text style={commonStyles.summaryNumberCell}>
                    {detailTotalAmount.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const openVendorDetail = (purchase: PurchaseRow) => {
        setSelectedVendorName(purchase.outSdCmpNm);
        console.log('거래처 클릭 purchase:'+JSON.stringify(purchase));
        const request = {
            cmpCd: user.cmpCd,
            outSdCmpCd: purchase.outSdCmpCd,
            dlvDt: purchase.dlvDt,
            salesOrgCd: user.salesOrgCd,
        }
        console.log('request:'+JSON.stringify(request));

        api.getPurchaseItem(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const purchaseItemList = result.data.responseBody;
                    console.log('purchaseList:' + JSON.stringify(purchaseItemList))
                    setPurchaseItemList(purchaseItemList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("getPurchaseItem error:" + error)
            });
    };

    const detailTotalAmount = useMemo(() => {
        return (purchaseItemList ?? []).reduce((acc, row) => acc + row.ordAmt, 0);
    }, [purchaseItemList]);
    const detailTotalQty = useMemo(() => {
        return (purchaseItemList ?? []).reduce((acc, row) => acc + row.ordQty, 0);
    }, [purchaseItemList]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={commonStyles.selectText}>{formattedDate(fromPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text style={commonStyles.tilde}>~</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={commonStyles.selectText}>{formattedDate(toPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>거래처</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholder="거래처 입력"
                        placeholderTextColor="#999"
                        value={vendorQuery}
                        onChangeText={setVendorQuery}
                        returnKeyType="search"
                        onSubmitEditing={onSearch}
                    />
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table data={purchaseList} columns={mainColumns} listFooter={renderFooter}/>

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromPurchaseDt(dateToYmd(date));
                    else setToPurchaseDt(dateToYmd(date));
                }}
            />

            <Modal visible={isDetailVisible}
                   transparent animationType="fade"
                   onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {selectedVendorName && (
                                <Text style={commonStyles.modalTitle}>{selectedVendorName}</Text>
                            )}
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={purchaseItemList}
                            columns={PurchaseDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooter}
                        />
                    </View>
                </View>
            </Modal>
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
};
