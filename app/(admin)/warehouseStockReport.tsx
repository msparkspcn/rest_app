import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerModal } from "../../components/DatePickerModal";
import ListModal from "../../components/ListModal";
import { Table } from "../../components/Table";
import Const from "../../constants/Const";
import { useUser } from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import { commonStyles } from "../../styles/index";
import { User } from "../../types";
import { ColumnDef } from "../../types/table";
import { dateToYmd, formattedDate, getTodayYmd } from "../../utils/DateUtils";

type StockRow = {
    cornerNm: string;
    itemCd: string;
    itemNm: string;
    stockIn: number;
    stockOut: number;
    // cornerNm: string;
    prevStock: number;
    currentStock: number;
};

type StockDetailRow = {
    cornerNm: string;
    stockDt: string;
    prevStock: number;
    stockIn: number;
    stockOut: number;
    currentStock: number;
}

type Vendor = {
    cmpCd: string;
    outSdCmpCd: string;
    outSdCmpNm: string
};


type ItemClass = {
    itemClassCd: string;
    itemClassNm: string;
}

export default function WarehouseStockReportScreen() {
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [currentPickerType, setCurrentPickerType] = useState('from')

    const [vendorList, setVendorList] = useState<Vendor[]>([]);
    const [itemClassList, setItemClassList] = useState<ItemClass[]>([]);

    const [selectedOutSdCmpCd, setSelectedOutSdCmpCd] = useState<string | null>(null);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showItemClassModal, setShowItemClassModal] = useState(false);
    const [itemQuery, setItemQuery] = useState('');
    const [selectedItemClass, setSelectedItemClass] = useState<string | null>(itemClassList[0]?.itemClassCd ?? null);
    const [showExistStockChecked, setShowExistStockChecked] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockRow | null>(null);
    const {user}:User = useUser();
    const [stockList, setStockList] = useState<[] | null>(null);
    const [stockDetailList, setStockDetailList] = useState<[] | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        getItemClassList();
        getVendorList();
    },[]);

    const getItemClassList = () => {
        const request = {
            cmpCd: user.cmpCd,
            itemClassLvlType: "L",
            itemClassTypeCd: "00",
            useYn: "1",
        }
        api.getItemClassList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const itemClassList = result.data.responseBody;
                    // console.log('List:' + JSON.stringify(itemClassList));
                    console.log('size:' + itemClassList.length);
                    setItemClassList([
                        { itemClassCd: '', itemClassNm: '전체' },
                        ...itemClassList
                    ]);
                }
            })
            .catch(error => {
                console.log("getItemClassList error:" + error)
            });
    }

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
                    setVendorList([
                        { outSdCmpCd: '', outSdCmpNm: '전체' },
                        ...vendorList
                    ]);
                }
            })
            .catch(error => {
                console.log("getVendorList error:" + error)
            });
    }

    const handleCheckbox = () => {
        setShowExistStockChecked(!showExistStockChecked)
    }

    const StockDetailColumns: ColumnDef<StockDetailRow>[] = useMemo(() => ([
        {key: 'stockDt', title: Const.DATE, flex: 2,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{item.stockDt}</Text>
            )
        },
        {
            key: 'prevStock', title: Const.TOTAL_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.prevStock.toLocaleString()}</Text>
            )
        },
        {
            key: 'stockIn', title: Const.GI_QTY, flex: 1.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.stockIn.toLocaleString()}</Text>
            )
        },
        {
            key: 'stockOut', title: Const.SALE, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.stockOut.toLocaleString()}</Text>
            )
        },
        {
            key: 'currentStock', title: Const.CUR_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.currentStock.toLocaleString()}</Text>
            )
        },
    ]), []);

    const onSearch = () => {
        restWarehouseStockList();
    };

    const restWarehouseStockList = () => {
        console.log("조회 클릭 fromSaleDt:"+fromSaleDt)
        const request = {
            cmpCd: user.cmpCd,
            dateFrom: fromSaleDt,
            dateTo: toSaleDt,
            itemCategory: selectedItemClass,
            itemNm: itemQuery,
            outSdCmpCd: selectedOutSdCmpCd,
            salesOrgCd: user.salesOrgCd,
            stockExistsOnly: showExistStockChecked
        }
        console.log('request:' + JSON.stringify(request))
        api.restWarehouseStockList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const stockList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(stockList))
                    setStockList(stockList);
                }
            })
            .catch(error => {
                console.log("restWarehouseStockList error:" + error)
            }).finally(() => setHasSearched(true));
    }

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const openDetail = (item: StockRow) => {
        console.log('item:' + JSON.stringify(item))
        setSelectedItem(item)
        restWarehouseStockList2(item);
    }

    const restWarehouseStockList2 = (item: StockRow) => {
        console.log("restWarehouseStockList2 조회 클릭 stock:"+JSON.stringify(item));
        const request = {
            cmpCd: user.cmpCd,
            dateFrom: fromSaleDt,
            dateTo: toSaleDt,
            itemCd: item.itemCd,
            salesOrgCd: user.salesOrgCd,
            storCd: "00000000",

        }
        console.log('request:'+JSON.stringify(request))
        api.restWarehouseStockList2(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const stockList = result.data.responseBody;
                    console.log('size:'+stockList.length);
                    console.log('stockList:' + JSON.stringify(stockList))
                    setStockDetailList(stockList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("restWarehouseStockList2 error:" + error)
            });
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
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 5}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'prevStock', title: Const.TOTAL_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.prevStock.toLocaleString()}</Text>
            )
        },
        {
            key: 'stockIn', title: Const.GI_QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.stockIn.toLocaleString()}</Text>
            )
        },
        {
            key: 'stockOut', title: Const.GO_QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.stockOut.toLocaleString()}</Text>
            )
        },
        {
            key: 'currentStock', title: Const.CUR_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell, {color: item.currentStock < 0 ? 'red' : 'black'}]}>
                    {item.currentStock.toLocaleString()}
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

    const detailTotalStockQty = useMemo(
        () => (stockDetailList ?? []).reduce((acc, row) => acc + row.prevStock, 0),
        [stockDetailList]
    );
    const detailTotalStockIn = useMemo(
        () => (stockDetailList ?? []).reduce((acc, row) => acc + row.stockIn, 0),
    [stockDetailList]
    );
    const detailTotalStockOut = useMemo(
        () => (stockDetailList ?? []).reduce((acc, row) => acc + row.stockOut, 0),
    [stockDetailList]
    );
    const detailTotalCurStockQty = useMemo(
        () => (stockDetailList ?? []).reduce((acc, row) => acc + row.currentStock, 0),
            [stockDetailList]
        );

    const renderDetailFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 2}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>
                    합계
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberCell, {color: detailTotalStockQty < 0 ? 'red' : ''}]}>
                    {detailTotalStockQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1.5}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberCell]}>
                    {detailTotalStockIn.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberCell]}>
                    {detailTotalStockOut.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberCell, {color: detailTotalCurStockQty < 0 ? 'red' : ''}]}>
                    {detailTotalCurStockQty.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.SEARCH_DT}</Text>
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
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_CLASS}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowItemClassModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{itemClassList.find(g => g.itemClassCd === selectedItemClass)?.itemClassNm || Const.SELECT}</Text>
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
                            style={commonStyles.selectText}>{vendorList.find(g => g.outSdCmpCd === selectedOutSdCmpCd)?.outSdCmpNm || Const.ALL}</Text>
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
                data={stockList}
                columns={mainColumns}
                hasSearched={hasSearched}
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
                data={itemClassList}
                keyField="itemClassCd"
                labelField="itemClassNm"
                onClose={() => setShowItemClassModal(false)}
                onSelect={(item) => {
                    setSelectedItemClass(item.itemClassCd);
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
                            data={stockDetailList}
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


