import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text, TextInput,
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

export default function RealtimeStockReportScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [itemNm, setItemNm] = useState('');
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
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
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
                <Text style={[commonStyles.cell,{paddingLeft: 10}]}>
                    {item.itemNm}
                </Text>
            ),
        },
        {
            key: 'totalStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'goQty', title: Const.GO_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.goQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell,
                    { color: item.curStockQty < 0 ? 'red' : ''}
                ]}>{item.curStockQty.toLocaleString()}</Text>
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
});


