import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
    Alert,
    FlatList,
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

type StockRow = {
    itemNm: string;
    giQty: number;
    goQty: number;
    totalStockQty: number;
    curStockQty: number;
};

type SalesOrg = { salesOrgCd: string; salesOrgNm: string };
type Corner = { cornerCd: string; cornerNm: string};

export default function StockReport() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [itemNm, setItemNm] = useState('');
    const salesOrgList: SalesOrg[] = useMemo(
        () =>
            Array.from({length: 6}).map((_, i) => {
                return {
                    salesOrgCd: `G${i + 1}`,
                    salesOrgNm: `그룹 ${i + 1}`
                };
            }),
        []
    );
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const [selectedSalesOrg, setSelectedSalesOrg] = useState<string | null>(salesOrgList[0]?.salesOrgCd ?? null);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const baseData: StockRow[] = useMemo(
        () =>
            Array.from({length: 15}).map((_, idx) => {
                const giQty = 7 + (idx % 5);
                const totalStockQty = 20 + (idx % 7);
                const goQty = 30 + (idx % 5);
                const curStockQty = totalStockQty + giQty - goQty;
                return {
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

    const onSearch = () => {
        if(selectedSalesOrgCd=='') {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }
    };

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<StockRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: Const.ITEM_NM, flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.itemNm}
                </Text>
            ),
        },
        {
            key: 'totalStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.totalStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'goQty', title: Const.GO_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.goQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell, {color: item.curStockQty < 0 ? 'red' : ''}]}>
                    {item.curStockQty.toLocaleString()}
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
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
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
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholderTextColor="#999"
                        value={itemNm}
                        onChangeText={setItemNm}
                        returnKeyType="search"
                        onSubmitEditing={onSearch}
                    />
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table data={filteredData} columns={mainColumns} />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromSaleDt(dateToYmd(date));
                    else setToSaleDt(dateToYmd(date));
                }}
            />

            <Modal visible={showSalesOrgListModal} transparent animationType="slide"
                   onRequestClose={() => setShowSalesOrgListModal(false)}>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <View style={commonStyles.listModalHeader}>
                            <Text style={commonStyles.modalTitle}>사업장 선택</Text>
                            <TouchableOpacity onPress={() => setShowSalesOrgListModal(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={salesOrgList}
                            keyExtractor={(item) => item.salesOrgCd}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={commonStyles.modalItem}
                                    onPress={() => {
                                        setSelectedSalesOrgCd(item.salesOrgCd);
                                        setShowSalesOrgListModal(false);
                                    }}
                                >
                                    <Text style={commonStyles.modalItemText}>{item.salesOrgNm}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
    modalTotalText: {
        fontWeight: '700',
        color: '#222',
    },
});


