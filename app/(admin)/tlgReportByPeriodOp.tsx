import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
    FlatList, Modal,
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
    salesOrgNm: string;
    gasType: string;
    tankCd: string;
    type: string;
    gasAmt: number;
};

type SalesOrg = { salesOrgCd: string; salesOrgNm: string };
type StoreGroup = { id: string; name: string };
export default function tlgReportByPeriodOp() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const salesOrgList: SalesOrg[] = useMemo(
        () => [
            {salesOrgCd: '', salesOrgNm: '전체'},
            ...Array.from({length: 6}).map((_, i) => ({
                salesOrgCd: `G${i + 1}`,
                salesOrgNm: `그룹 ${i + 1}`
            })),
        ],
        []
    );
    const [selectedSalesOrg, setSelectedSalesOrg] = useState<SalesOrg | null>(salesOrgList[0] ?? null);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
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
                    salesOrgNm: `주유소 ${idx + 1}`,
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

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<TlgRow>[] = useMemo(() => ([
        {
            key: 'salesOrgNm', title: '사업장', flex: 1.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.salesOrgNm}
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
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => {
                        setShowSalesOrgListModal(true)
                    }}>
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.ALL}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>구분</Text>
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
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
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


