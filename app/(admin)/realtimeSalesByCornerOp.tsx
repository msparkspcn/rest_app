import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import MyRadioGroup from "../../components/ui/RadioGroup";
import {User, SalesOrg, Corner} from "../../types";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import ListModal from "../../components/ListModal";
type SaleRow = {
    cornerNm: string;
    saleAmt: number;
    dayCompRatio: string;
    monthSaleAmt: number;
    monthCompRatio: string
};
type SaleDetailRow = {
    no: number;
    itemNm: string;
    qty: number;
    totalAmt: number;
    compRatio: string;
}

type CornerRow = {
    no: number;
    cornerNm: string;
    cornerCd: string;
    posGroup: string;
    useYn: 'Y' | 'N';
};

export default function RealtimeSalesByCornerOp() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedCorner, setSelectedCorner] = useState<CornerRow | null>(null);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const [dcIncludedChecked, setDcIncludedChecked] = useState(false);
    const [selected, setSelected] = useState('option1');
    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [cornerList, setCornerList] = useState<Corner[]>([]);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>('');
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string | null>('');


    useEffect(() => {
        getSalesOrgList();
    },[]);

    useEffect(() => {
        getCornerList(selectedSalesOrgCd)
    },[selectedSalesOrgCd])

    const getSalesOrgList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operType: '',
            restValue: '',
        }
        console.log("request:"+JSON.stringify(request))
        api.getSalsOrgList(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result))
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    console.log('salesOrgList:' + JSON.stringify(salesOrgList))
                    setSalesOrgList(salesOrgList);
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    }

    const getCornerList = (salesOrgCd: string) => {
        console.log("getCornerList selectedSalesOrgCd:"+salesOrgCd+",cmpCd:"+user.cmpCd)
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: selectedSalesOrgCd
        }
        api.getCornerList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const cornerList = result.data.responseBody;
                    console.log('cornerList:' + JSON.stringify(cornerList))
                    setCornerList([
                        { cornerCd: '', cornerNm: '전체' },
                        ...cornerList
                    ]);
                }
            })
            .catch(error => {
                console.log("getCornerList error:" + error)
            });
    };

    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 20}).map((_, idx) => {
                const saleAmt = 10000 + (idx % 5) * 3000;
                const dayCompRatio = (saleAmt/100).toFixed(1)+'%';
                const monthSaleAmt = 10000 + (idx % 5);
                const monthCompRatio = (monthSaleAmt / 100).toFixed(1)+'%';
                return {
                    cornerNm: `그룹 ${idx + 1}`,
                    saleAmt: saleAmt,
                    dayCompRatio: dayCompRatio,
                    monthSaleAmt: monthSaleAmt,
                    monthCompRatio: monthCompRatio,
                };
            }),
        []
    );

    // const filteredData = useMemo(() => {
    //     if (!selectedStorCd) return baseData;
    //     const groupName = posGroups.find(g => g.id === selectedStorCd)?.name;
    //     return baseData.filter(r => (groupName ? r.cornerNm === groupName : true));
    // }, [baseData, posGroups, selectedStorCd]);

    const onSearch = () => {
        if(selectedSalesOrgCd=='') {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (corner: CornerRow) => {
        console.log('corner:' + JSON.stringify(corner))
        setSelectedCorner(corner)
        setIsDetailVisible(true);
    }
    const handleDcIncludedToggle = () => {
        setDcIncludedChecked(!dcIncludedChecked)
    }
    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'cornerNm', title: Const.CORNER_NM, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.cornerNm}
                </Text>
            ),
        },
        {
            key: 'saleAmt', title: Const.SALE_AMT, flex: 0.9, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.saleAmt.toLocaleString()}</Text>
                </Pressable>
            )
        },
        {
            key: 'dayCompRatio', title: Const.COMP_RATIO, flex: 0.8, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.dayCompRatio.toLocaleString()}</Text>
            )
        },
        {
            key: 'monthSaleAmt', title: Const.MONTH_TOTAL_AMT, flex: 1.2, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.monthSaleAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'monthCompRatio', title: Const.COMP_RATIO, flex: 0.8, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.monthCompRatio.toLocaleString()}</Text>
            )
        },
    ]), [])

    // const totalSaleAmt = useMemo(() => filteredData.reduce((acc, r) => acc + r.saleAmt, 0), [filteredData]);
    // const totalMonthSaleAmt = useMemo(() => filteredData.reduce((acc, r) => acc + r.monthSaleAmt, 0), [filteredData]);


    // const renderFooter = () => (
    //     <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
    //         <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
    //             <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText,
    //                 {fontSize: 13, fontWeight: 'bold'}]}>{Const.TOTAL_AMT}</Text>
    //         </View>
    //         <View style={[{flex: 1.7}, commonStyles.tableRightBorder]}>
    //             <Text style={[commonStyles.cell, styles.totalText, commonStyles.numberCell]}>{totalSaleAmt.toLocaleString()}</Text>
    //         </View>
    //         <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
    //             <Text style={[commonStyles.cell, styles.totalText, commonStyles.numberCell]}>{totalMonthSaleAmt.toLocaleString()}</Text>
    //         </View>
    //     </View>
    // );

    const detailData: SaleDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = 10+ idx;
                const totalAmt = qty * 11000;
                return {
                    no: idx + 1,
                    itemNm: `상품명 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    qty,
                    totalAmt,
                    compRatio: ((totalAmt / 10)).toFixed(1) + '%'
                };
            }),
        []
    );

    const summaryRow = useMemo(() => {
        const totalSaleAmt = detailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalQty = detailData.reduce((sum, item) => sum + item.qty, 0);
        const totalCompRatio = detailData.reduce((sum, item) => sum + item.compRatio, 0.0+'%');
        return {
            totalQty: totalQty,
            totalSaleAmt: totalSaleAmt,
            totalCompRatio: totalCompRatio
        };
    }, [detailData]);

    const SaleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5, align: 'center'},
        {key: 'itemNm', title: Const.ITEM_NM, flex: 2, align: 'center'},
        {
            key: 'qty', title: Const.QTY, flex: 0.6, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'compRatio', title: Const.COMP_RATIO, flex: 0.6, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalAmt.toLocaleString()}%</Text>
            )
        },
    ]), []);

    const renderDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                <View style={[{flex: 2.5}, commonStyles.tableRightBorder]}>
                    <Text
                        style={[commonStyles.modalCell,
                            {
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 0.6}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberCell]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberCell]}>
                        {summaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 0.6}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberCell]}>
                        100%
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장명</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
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
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={styles.selectText}>{cornerList.find(g => g.cornerCd === selectedCornerCd)?.cornerNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>출력순서</Text>
                    <MyRadioGroup
                        options={[
                            { label: '매장명', value: 'option1' },
                            { label: '매장순서', value: 'option2' },
                        ]}
                        selected={selected}
                        onChange={setSelected}
                    />
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>DC포함</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleDcIncludedToggle}
                    >
                        <View style={[commonStyles.checkbox, dcIncludedChecked && commonStyles.checkboxChecked]}>
                            {dcIncludedChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            {/*<Table*/}
            {/*    data={filteredData}*/}
            {/*    columns={mainColumns}*/}
            {/*    listFooter={renderFooter}*/}
            {/*/>*/}

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />

            <ListModal
                visible={showCornerModal}
                title="매장 선택"
                data={cornerList}
                keyField="cornerCd"
                labelField="cornerNm"
                onClose={() => setShowCornerModal(false)}
                onSelect={(item) => {
                    setSelectedCornerCd(item.cornerCd);
                    setShowCornerModal(false);
                }}
            />

            <ListModal
                visible={showSalesOrgListModal}
                title="사업장 선택"
                data={salesOrgList}
                keyField="salesOrgCd"
                labelField="salesOrgNm"
                onClose={() => setShowSalesOrgListModal(false)}
                onSelect={(item) => {
                    setSelectedSalesOrgCd(item.salesOrgCd);
                    setShowSalesOrgListModal(false);
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
                            <Text style={commonStyles.modalTitle}>{selectedCorner?.cornerNm}</Text>
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={detailData}
                            columns={SaleDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooterRow}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
    totalText: {fontWeight: '700', color: '#222'},

});


