import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";

type StockRow = {
    cornerNm: string;
    itemNm: string;
    giQty: number;
    goQty: number;
    // cornerNm: string;
    totalStockQty: number;
    curStockQty: number;
};

type StockDetailRow = {
    cornerNm: string;
    stockDt: string;
    totalStockQty: number;
    giQty: number;
    saleQty: number;
    curStockQty: number;
}

type Vendor = {
    cmpCd: string;
    outSdCmpCd: string;
    outSdCmpNm: string
};
type ItemClass = {
    id: string;
    name: string;
}

export default function WarehouseStockReportScreen() {
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [currentPickerType, setCurrentPickerType] = useState('from')

    const [vendorList, setVendorList] = useState<Vendor[]>([]);
    const itemClasses: ItemClass[] = useMemo(
        () => Array.from({length: 6}).map((_, i) => ({id: `G${i + 1}`, name: `상품분류 ${i + 1}`})),
        []
    );

    const [selectedOutSdCmpCd, setSelectedOutSdCmpCd] = useState<string | null>(null);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showItemClassModal, setShowItemClassModal] = useState(false);
    const [itemQuery, setItemQuery] = useState('');
    const [selectedItemClass, setSelectedItemClass] = useState<string | null>(itemClasses[0]?.id ?? null);
    const [showExistStockChecked, setShowExistStockChecked] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockRow | null>(null);
    const {user} = useUser();

    useEffect(() => {
        console.log('api 테스트1');
        getVendorList();
    },[]);

    const getVendorList = () => {
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd,
            schValue: '',
        }
        api.getVendorList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const vendorList = result.data.responseBody;
                    console.log('List:' + JSON.stringify(vendorList))
                    setVendorList(vendorList);
                }
            })
            .catch(error => {
                console.log("getVendorList error:" + error)
            });
    }

    const handleCheckbox = () => {
        setShowExistStockChecked(!showExistStockChecked)
    }
    const baseData: StockRow[] = useMemo(
        () =>
            Array.from({length: 15}).map((_, idx) => {
                const giQty = 7 + (idx % 5);
                const totalStockQty = 20 + (idx % 7);
                const goQty = 30 + (idx % 5);
                const curStockQty = totalStockQty + giQty - goQty;
                return {
                    cornerNm: '파스쿠찌',
                    itemNm: `상품 ${((idx % 6) + 1)}`,
                    giQty: giQty,
                    totalStockQty: totalStockQty,
                    goQty: goQty,
                    curStockQty: curStockQty,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        return baseData;
    }, [baseData]);

    const detailData: StockDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                return {
                    cornerNm: '파스쿠찌',
                    stockDt: `2025/09/0${idx + 1}`,
                    totalStockQty: qty,
                    giQty: qty,
                    saleQty: qty,
                    curStockQty: qty
                };
            }),
        []
    );

    const StockDetailColumns: ColumnDef<StockDetailRow>[] = useMemo(() => ([
        {key: 'stockDt', title: Const.DATE, flex: 2,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{item.stockDt}</Text>
            )
        },
        {
            key: 'totalStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 1.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'saleQty', title: Const.SALE, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.curStockQty.toLocaleString()}</Text>
            )
        },
    ]), []);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const openDetail = (
        item: StockRow
    ) => {
        console.log('item:' + JSON.stringify(item))
        setSelectedItem(item)
        setIsDetailVisible(true);
    }

    const mainColumns: ColumnDef<StockRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: Const.ITEM_NM, flex: 2,
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'totalStockQty', title: Const.TOTAL_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.totalStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'goQty', title: Const.GO_QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.goQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell, {color: item.curStockQty < 0 ? 'red' : 'black'}]}>
                    {item.curStockQty.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    const CornerNmRow = () => {
        return (
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                <Text style={styles.modalCornerNm}>{selectedItem?.cornerNm} 매장재고현황</Text>
            </View>
        );
    };

    const detailTotalStockQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.totalStockQty, 0);
    }, [detailData]);
    const detailTotalGiQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.giQty, 0);
    }, [detailData]);
    const detailTotalSaleQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.saleQty, 0);
    }, [detailData]);
    const detailTotalCurStockQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.curStockQty, 0);
    }, [detailData]);

    const renderDetailFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>
                    합계
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.numberCell, {color: detailTotalStockQty < 0 ? 'red' : ''}]}>
                    {detailTotalStockQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.numberCell]}>
                    {detailTotalGiQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.numberCell]}>
                    {detailTotalSaleQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.numberCell, {color: detailTotalCurStockQty < 0 ? 'red' : ''}]}>
                    {detailTotalCurStockQty.toLocaleString()}
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
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_CLASS}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowItemClassModal(true)}>
                        <Text
                            style={styles.selectText}>{itemClasses.find(g => g.id === selectedItemClass)?.name || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholderTextColor="#999"
                        value={itemQuery}
                        onChangeText={setItemQuery}
                        returnKeyType="search"
                        onSubmitEditing={onSearch}
                    />
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.VENDOR}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowVendorModal(true)}>
                        <Text
                            style={styles.selectText}>{vendorList.find(g => g.outSdCmpCd === selectedOutSdCmpCd)?.outSdCmpNm || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.SHOW_EXIST_STOCK_LIST}</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleCheckbox}
                    >
                        <View style={[commonStyles.checkbox, showExistStockChecked && commonStyles.checkboxChecked]}>
                            {showExistStockChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>


            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table
                data={filteredData}
                columns={mainColumns}
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
                visible={showItemClassModal}
                title="상품분류 선택"
                data={itemClasses}
                keyField="id"
                labelField="name"
                onClose={() => setShowItemClassModal(false)}
                onSelect={(item) => {
                    setSelectedItemClass(item.id);
                    setShowItemClassModal(false);
                }}
            />

            <ListModal
                visible={showVendorModal}
                title="거래처 선택"
                data={vendorList}
                keyField="outSdCmpCd"
                labelField="outSdCmpNm"
                onClose={() => setShowVendorModal(false)}
                onSelect={(item) => {
                    setSelectedOutSdCmpCd(item.outSdCmpCd);
                    setShowVendorModal(false);
                }}
            />

            <Modal
                visible={isDetailVisible}
                transparent animationType="fade"
                onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}
                      pointerEvents="box-none">
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{selectedItem?.itemNm}</Text>
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={detailData}
                            columns={StockDetailColumns}
                            isModal={true}
                            listHeader={CornerNmRow}
                            listFooter={renderDetailFooter}
                        />
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#333',
    },
    modalCornerNm: {
        fontSize: 14,
        color: '#555',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    modalTotalRow: {
        backgroundColor: '#fafafa',
    },
    modalTotalText: {
        fontWeight: '700',
        color: '#222',
    }
});


