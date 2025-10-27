import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import * as api from "../../services/api/api";
import {User} from "../../types/user";
import {useUser} from "../../contexts/UserContext";
import LoadingOverlay from "../../components/LoadingOverlay";

type PurchaseRow = {
    itemCd: string;
    itemNm: string;
    ordQty: number;
    ordAmt: number
};
type PurchaseDetailRow = {
    outSdCmpNm: string;
    dlvDt: string;
    ordQty: number;
    ordAmt: number;
};
export default function PurchaseProductReportScreen() {
    const [fromPurchaseDt, setFromPurchaseDt] = useState(getTodayYmd());
    const [toPurchaseDt, setToPurchaseDt] = useState(getTodayYmd());
    const [productQuery, setProductQuery] = useState('');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedItemNm, setSelectedItemNm] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [purchaseList, setPurchaseList] = useState<[] | null>(null);
    const [purchaseItemList, setPurchaseItemList] = useState<[] | null>(null);
    const {user}: User = useUser();

    const totalOrdAmt = useMemo(() => (purchaseList ?? []).reduce((acc, r) => acc + r.ordAmt, 0), [purchaseList]);

    const onSearch = () => {
        console.log("조회 클릭");
        const request = {
            cmpCd: user.cmpCd,
            itemKey: productQuery,
            fromDate: fromPurchaseDt,
            salesOrgCd: user.salesOrgCd,
            toDate: toPurchaseDt
        }
        console.log('request:' + JSON.stringify(request));
        setLoading(true);

        api.getPurchaseListByItem(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const purchaseList = result.data.responseBody;
                    console.log('purchaseList:' + JSON.stringify(purchaseList));
                    setPurchaseList(purchaseList);
                }
            })
            .catch(error => {
                console.log("getPurchaseListByItem error:" + error)
            }).finally(() => setLoading(false));
    };

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: '상품명', flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Pressable
                    style={commonStyles.columnPressable}
                    onPress={() => openProductDetail(item)}
                >
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 5}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'ordQty', title: Const.QTY, flex: 0.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.ordQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'ordAmt', title: '금액', flex: 0.8, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.ordAmt.toLocaleString()}</Text>
            )
        },
    ]), [fromPurchaseDt, toPurchaseDt]);

    const totalQty = useMemo(() => (purchaseList ?? []).reduce((acc, r) => acc + r.ordQty, 0), [purchaseList]);

    const renderFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 1.7}, commonStyles.columnContainer, styles.totalText]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText]}>합계</Text>
            </View>
            <View style={[{flex: 0.5}, commonStyles.columnContainer]}>
                <Text style={commonStyles.numberCell}>
                    {totalQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 0.8}, commonStyles.columnContainer]}>
                <Text style={commonStyles.numberCell}>
                    {totalOrdAmt.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const openProductDetail = (purchase: PurchaseRow) => {
        setSelectedItemNm(purchase.itemNm);
        console.log('거래처 클릭 purchase:' + JSON.stringify(purchase));
        const request = {
            cmpCd: user.cmpCd,
            fromDate: fromPurchaseDt,
            itemCd: purchase.itemCd,
            salesOrgCd: user.salesOrgCd,
            toDate: toPurchaseDt,
        }
        console.log('request:' + JSON.stringify(request));

        api.getPurchaseDetailListByItem(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const purchaseItemList = result.data.responseBody;
                    purchaseItemList.sort((a, b) => {
                        if (a.dlvDt < b.dlvDt) return -1;
                        if (a.dlvDt > b.dlvDt) return 1;
                        return 0;
                    });
                    console.log('purchaseItemList:' + JSON.stringify(purchaseItemList))
                    setPurchaseItemList(purchaseItemList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("getPurchaseDetailListByItem error:" + error)
            });
    };

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        {key: 'outSdCmpNm', title: '거래처', flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.outSdCmpNm}
                </Text>
            )
        },
        {
            key: 'dlvDt', title: '일자', flex: 1.2,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                    {formattedDate(item.dlvDt)}
                </Text>
            )
        },
        {
            key: 'ordQty', title: Const.QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.ordQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'ordAmt', title: '금액', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.ordAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const detailTotalOrdAmt = useMemo(() => {
        return (purchaseItemList ?? []).reduce((acc, row) => acc + row.ordAmt, 0);
    }, [purchaseItemList]);
    const detailTotalQty = useMemo(() => {
        return (purchaseItemList ?? []).reduce((acc, row) => acc + row.ordQty, 0);
    }, [purchaseItemList]);

    const renderDetailFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 2.7}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.modalCell, commonStyles.alignCenter, styles.modalTotalText]}>
                    {Const.TOTAL_AMT_SHORT}
                </Text>
            </View>
            <View style={[{flex: 0.5}, commonStyles.columnContainer]}>
                <Text
                    style={commonStyles.numberSmallCell}>
                    {detailTotalQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.columnContainer]}>
                <Text style={commonStyles.numberSmallCell}>
                    {detailTotalOrdAmt.toLocaleString()}
                </Text>
            </View>
        </View>
    );

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
                    <Text style={commonStyles.filterLabel}>상품명</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholder="상품명 입력"
                        placeholderTextColor="#999"
                        value={productQuery}
                        onChangeText={setProductQuery}
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

            <Modal
                visible={isDetailVisible}
                transparent animationType="fade"
                onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {selectedItemNm && <Text style={commonStyles.modalTitle}>{selectedItemNm}</Text>}
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
            {loading && (<LoadingOverlay/>)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    totalRow: {backgroundColor: '#fafafa'},
    totalText: {fontWeight: '700', color: '#222'},
    modalTotalText: {fontWeight: '700', color: '#222'},
});
