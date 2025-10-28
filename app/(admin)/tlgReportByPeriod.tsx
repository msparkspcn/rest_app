import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
    Pressable,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

type StoreGroup = { id: string; name: string };
export default function tlgReportScreen() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from');

    const [itemNm, setItemNm] = useState('');
    const storeGroups: StoreGroup[] = useMemo(
        () => [
            {id: "", name: "전체"},
            {id: "01", name: "주유소"},
            {id: "02", name: "충전소"}
        ],
        []
    );
    const [registerFilter, setRegisterFilter] = useState<StoreGroup>(storeGroups[0]);
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
            key: 'dt', title: Const.DATE, flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'center'}]}>
                    {item.dt}
                </Text>
            ),
        },
        {
            key: 'type', title: Const.TYPE, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                    {item.type}
                </Text>
            )
        },
        {
            key: 'gasType', title: Const.GAS_TYPE, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                    {item.gasType}
                </Text>
            )
        },
        {
            key: 'tankCd', title: Const.TANK_NO, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                    {item.tankCd}
                </Text>
            )
        },
        {
            key: 'gasAmt', title: Const.GAS_AMT, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, {color: item.gasAmt < 0 ? 'red' : ''}]}>{
                    item.gasAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
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
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <View style={commonStyles.segmented}>
                        {storeGroups.map((option) => (
                            <Pressable
                                key={option.id}
                                onPress={() => setRegisterFilter(option)}
                                style={[commonStyles.segmentItem, registerFilter.id === option.id && commonStyles.segmentItemActive]}
                            >
                                <Text
                                    style={[commonStyles.segmentText, registerFilter.id === option.id && commonStyles.segmentTextActive]}>
                                    {option.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
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

