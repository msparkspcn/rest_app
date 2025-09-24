import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
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

type StockRow = {
    itemNm: string;
    giQty: number;
    saleQty: number;
    whStockQty: number;
    curStockQty: number;
};

type Vendor = { id: string; name: string };
type SearchCond = { id: string; name: string };
type Corner = { id: string; name: string};

export default function CornerWhStockReportScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const vendors: Vendor[] = useMemo(
        () => Array.from({length: 6}).map((_, i) => ({id: `G${i + 1}`, name: `거래처 ${i + 1}`})),
        []
    );
    const corners: Corner[] = useMemo(
        () => Array.from({length: 6}).map((_, i) => ({id: `G${i + 1}`, name: `매장 ${i + 1}`})),
        []
    );

    const searchCond: SearchCond[] = [{ id: "realtime", name: "실시간 기준" },
        { id: "closing", name: "영업 마감 기준" }]
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(vendors[0]?.id ?? null);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [showSearchCond, setShowSearchCond] = useState(false);
    const [vendorQuery, setVendorQuery] = useState('');
    const [selectedSearchCond, setSelectedSearchCond] = useState<string | null>(searchCond[0]?.id ?? null);
    const [selectedCorner, setSelectedCorner] = useState<string | null>(corners[0]?.id ?? null);
    const baseData: StockRow[] = useMemo(
        () =>
            Array.from({length: 15}).map((_, idx) => {
                const giQty = 7 + (idx % 5);
                const totalStockQty = 20 + (idx % 7);
                const saleQty = 30 + (idx % 5);
                const curStockQty = totalStockQty + giQty - saleQty;
                return {
                    itemNm: `상품 ${((idx % 6) + 1)}`,
                    giQty: giQty,
                    whStockQty: 0,
                    saleQty: saleQty,
                    curStockQty: curStockQty,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        return baseData;
    }, [baseData]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<StockRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 1, align: 'center',
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: Const.ITEM_NM, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.itemNm}
                </Text>
            ),
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'saleQty', title: Const.SALE, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10,
                    color: item.curStockQty < 0 ? 'red' : 'black',
                }]}>{item.curStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'whStockQty', title: Const.WH_STOCK_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10,
                    color: item.whStockQty < 0 ? 'red' : 'black',
                }]}>{item.whStockQty.toLocaleString()}</Text>
            )
        },
    ]), [])

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={styles.selectText}>{corners.find(g => g.id === selectedCorner)?.name || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.VENDOR}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowVendorModal(true)}>
                        <Text
                            style={styles.selectText}>{vendors.find(g => g.id === selectedVendorId)?.name || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.SEARCH_COND}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSearchCond(true)}>
                        <Text
                            style={styles.selectText}>{searchCond.find(g => g.id === selectedSearchCond)?.name || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <TextInput
                        style={commonStyles.input}
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

            <Table
                data={filteredData}
                columns={mainColumns}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />

            <ListModal
                visible={showCornerModal}
                title="매장 선택"
                data={corners}
                onClose={() => setShowCornerModal(false)}
                onSelect={(item) => {
                    setSelectedCorner(item.id);
                    setShowCornerModal(false);
                }}
            />

            <ListModal
                visible={showVendorModal}
                title="거래처 선택"
                data={vendors}
                onClose={() => setShowVendorModal(false)}
                onSelect={(item) => {
                    setSelectedVendorId(item.id);
                    setShowVendorModal(false);
                }}
            />

            <ListModal
                visible={showSearchCond}
                title="조회기준 선택"
                data={searchCond}
                onClose={() => setShowSearchCond(false)}
                onSelect={(item) => {
                    setSelectedSearchCond(item.id);
                    setShowSearchCond(false);
                }}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
});


