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

type TlgRow = {
    dt: string;
    gasType: string;
    tankCd: string;
    type: string;
    gasAmt: number;
};


export default function tlgReportScreen() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from');

    const [itemNm, setItemNm] = useState('');
    const baseData: TlgRow[] = useMemo(
        () =>
            Array.from({length: 9}).map((_, idx) => {
                const gasType = '무연경유';
                const type = '주유소';
                const gasAmt =  (idx % 5) *1000;
                return {
                    dt: `2025/09/0${idx + 1}`,
                    gasType: gasType,
                    type: type,
                    tankCd: `0${idx + 1}`,
                    gasAmt: gasAmt,
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

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<TlgRow>[] = useMemo(() => ([
        {
            key: 'dt', title: Const.DATE, flex: 1.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.dt}
                </Text>
            ),
        },
        {
            key: 'type', title: Const.TYPE, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'center'
                }]}>{item.type}</Text>
            )
        },
        {
            key: 'gasType', title: Const.GAS_TYPE, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'center'
                }]}>{item.gasType}</Text>
            )
        },
        {
            key: 'tankCd', title: Const.TANK_NO, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                    {item.tankCd}
                </Text>
            )
        },
        {
            key: 'gasAmt', title: Const.GAS_AMT, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10,
                    color: item.gasAmt < 0 ? 'red' : 'black',
                }]}>{item.gasAmt.toLocaleString()}</Text>
            )
        },
    ]), [])

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
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromSaleDt(dateToYmd(date));
                    else setToSaleDt(dateToYmd(date));
                }}
            />
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


