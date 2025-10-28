import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, Text, TouchableOpacity, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import {User, SalesOrg} from "../../types";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import ListModal from "../../components/ListModal";
import {AntDesign} from "@expo/vector-icons";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    salesOrgCd: string;
    orgNm: string;
    no: number;

    lastWeekActualSaleRatio: number; //부가세 적용X, DC적용 -> 기본값
    yesterdayActualSaleRatio: number;

    actualSaleAmt: number
    totalSaleAmt: number
};

type Sale = {
    salesOrgCd: string;
    salesOrgNm: string;
    lastWeekSaleRatio: number;  //부가세 적용X, DC적용 X 총 매출
    yesterdaySaleRatio: number;

    lastWeekActualSaleRatio: number; //부가세 적용X, DC적용 -> 기본값
    yesterdayActualSaleRatio: number;

    lastWeekNetSaleRatio: number;  //부가세 적용, DC적용
    yesterdayNetSaleRatio: number;

    lastWeekExceptVatRatio: number; // 부가세 적용, DC 적용 X
    yesterdayExceptVatRatio: number;

    saleAmt: number;
    actualSaleAmt: number;
    netSaleAmt: number;
    saleExceptVatAmt: number;
    vatAmt: number;
    totalSaleAmt: number;
}

export default function RealtimeSalesRatio() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);

    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);

    const [vatExcludedChecked, setVatExcludedChecked] = useState(false);
    const [appliedVatChecked, setAppliedVatChecked] = useState(false);
    const [dcIncludedChecked, setDcIncludedChecked] = useState(true);
    const [appliedDcChecked, setAppliedDcChecked] = useState(false);

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const [saleList, setSaleList] = useState<Sale[]>([]);
    const [saleStatList ,setSaleStatList] = useState<[] | null>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    },[]);

    const getSalesOrgList = () => {
        const request = { cmpCd: user.cmpCd }
        api.getSalsOrgList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    setSalesOrgList([{salesOrgCd:'', salesOrgNm: '전체'}, ...salesOrgList]);
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    }

    const onSearch = () => {
        console.log("조회 클릭 selectedSalesOrgCd:"+selectedSalesOrgCd.length);
        setAppliedDcChecked(dcIncludedChecked);
        setAppliedVatChecked(vatExcludedChecked);

        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);

        api.mobOperRealTimeSaleRatio(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    if(saleList.length > 0) {
                        mobOperRealTimeSaleStat();
                    }
                    else {
                        setLoading(false);
                    }
                }
            })
            .catch(error => {
                setLoading(false);
                console.log("mobOperRealTimeSaleRatio error:" + error)
            });
    };

    const mobOperRealTimeSaleStat = () => {
        console.log("실적 조회")

        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        // setLoading(true);
        api.mobOperRealTimeSaleStat(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleStatList = result.data.responseBody;
                    // console.log('saleStatList:' + JSON.stringify(saleStatList))
                    setSaleStatList(saleStatList);
                    setLoading(false);
                }
            })
            .catch(error => {
                setLoading(false);
                console.log("mobOperRealTimeSaleStat error:" + error)
            });
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow & { isRatioSummary?: boolean; }>[] = useMemo(() => {
        let saleAmt = 0;
        let lastWeekSaleRatio = 0;
        let yesterdaySaleRatio = 0;
        const calcSaleValue = (row: any) => {
            if (appliedVatChecked && appliedDcChecked) {
                saleAmt = row.saleExceptVatAmt;
                lastWeekSaleRatio = row.lastWeekExceptVatRatio;
                yesterdaySaleRatio = row.yesterdayExceptVatRatio;
            } else if (appliedVatChecked && !appliedDcChecked) {
                saleAmt = row.netSaleAmt;
                lastWeekSaleRatio = row.lastWeekNetSaleRatio;
                yesterdaySaleRatio = row.yesterdayNetSaleRatio;
            } else if (!appliedVatChecked && appliedDcChecked) {
                saleAmt = row.saleAmt;
                lastWeekSaleRatio = row.lastWeekSaleRatio;
                yesterdaySaleRatio = row.yesterdaySaleRatio;
            } else {
                saleAmt = row.actualSaleAmt;
                lastWeekSaleRatio = row.lastWeekActualSaleRatio;
                yesterdaySaleRatio = row.yesterdayActualSaleRatio;
            }

            return { saleAmt, lastWeekSaleRatio, yesterdaySaleRatio };
        };
            return [
        {key: 'no', title: Const.NO, flex: 0.4,
            renderCell: (_item) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{_item.no}</Text>
            ),
        },
        {
            key: 'salesOrgNm', title: '사업소', flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.salesOrgNm}
                </Text>
            ),
        },
        {key: 'lastWeekActualSaleRatio', title: '전주대비', flex: 1,
            renderCell: (item) => {
                const { lastWeekSaleRatio } = calcSaleValue(item);
                const isUp = lastWeekSaleRatio > 0;
                return (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end'}}>
                        <Text style={commonStyles.numberCell}>
                            {lastWeekSaleRatio.toLocaleString()}
                        </Text>
                        <AntDesign
                            name={isUp ? 'caretup' : 'caretdown'}
                            size={13}
                            color={isUp ? 'red' : 'blue'}
                            style={{marginRight: 2}}
                        />
                    </View>
                )
            }
        },
        {
            key: 'yesterdayActualSaleRatio', title: '전일대비', flex: 1,
            renderCell: (item) => {
                const { yesterdaySaleRatio } = calcSaleValue(item);
                const isUp = yesterdaySaleRatio > 0;
                return (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end'}}>
                        <Text style={commonStyles.numberCell}>
                            {yesterdaySaleRatio.toLocaleString()}
                        </Text>
                        <AntDesign
                            name={isUp ? 'caretup' : 'caretdown'}
                            size={13}
                            color={isUp ? 'red' : 'blue'}
                            style={{marginRight: 2}}
                        />
                    </View>
                )
            }
        },
        {key: 'actualSaleAmt', title: '총매출', flex: 1.3,
            renderCell: (item) => {
                const { saleAmt } = calcSaleValue(item);
            return (
                    <Text style={commonStyles.numberCell}>
                        {saleAmt.toLocaleString()}
                    </Text>
                )
            }
        },
    ]}, [appliedVatChecked, appliedDcChecked]);

    const tableData = useMemo(() => {
        if (!saleList) return []; // null 방지

        const result: (SaleRow & { isRatioSummary?: boolean })[] = [];

        const grouped: Record<string, Sale[]> = {};
        saleList.forEach(item => {
            if (!grouped[item.operDiv]) grouped[item.operDiv] = [];
            grouped[item.operDiv].push(item);
        });

        let no = 0;
        let sumNo = 0;
        Object.keys(grouped)
            .sort()
            .forEach(operDiv => {
                const rows = grouped[operDiv];
                let storSum = 0;
                let yesDaySum = 0;
                let lastWeekSum = 0;
                rows.forEach((item) => {
                    if (appliedVatChecked && appliedDcChecked) {
                        storSum += item.saleExceptVatAmt;
                        yesDaySum += storSum / (1 + (item.yesterdayExceptVatRatio/100));
                        lastWeekSum += storSum / (1 + (item.lastWeekExceptVatRatio/100));
                        console.log('1,1');
                    } //부가세 적용, DC적용 X -> 1,1 -> X
                    else if (appliedVatChecked && !appliedDcChecked) {
                        storSum += item.netSaleAmt;
                        yesDaySum += storSum / (1 + (item.yesterdayNetSaleRatio/100));
                        lastWeekSum += storSum / (1 + (item.lastWeekNetSaleRatio/100));
                        console.log('1,0');
                    } //부가세 적용, DC적용 O 순매출 -> 1,0 -> X *982,196,933
                    else if (!appliedVatChecked && appliedDcChecked) {
                        storSum += item.saleAmt;
                        yesDaySum += storSum / (1 + (item.yesterdaySaleRatio/100));
                        lastWeekSum += storSum / (1 + (item.lastWeekSaleRatio/100));
                        console.log('0,1');
                    } //부가세 적용X, DC적용 X 총 매출(기본) -> 0,1 -> O *1,086,037,629
                    else if (!appliedVatChecked && !appliedDcChecked) {
                        storSum += item.actualSaleAmt;
                        yesDaySum += storSum / (1 + (item.yesterdayActualSaleRatio/100));
                        lastWeekSum += storSum / (1 + (item.lastWeekActualSaleRatio/100));
                        console.log('0,0');
                    } //부가세 적용X, DC적용 시재 O -> 0,0 -> O *1,085,737,849
                    no += 1;
                    result.push({
                        ...item,
                        no: no
                    });
                });
                console.log('storSum:'+storSum);
                console.log('yesDaySum:'+yesDaySum);
                console.log('lastWeekSum:'+lastWeekSum);
                if(selectedSalesOrgCd.length == 0) {
                    let summaryName = '';
                    if (operDiv === '01') summaryName = '휴게소 소계';
                    else if (operDiv === '02') summaryName = Const.OIL_SUMMARY;
                    sumNo -= 1;
                    result.push({
                        salesOrgCd: "",
                        orgNm: summaryName,
                        no: sumNo,
                        actualSaleAmt: storSum,
                        totalSaleAmt: storSum,
                        isRatioSummary: true,
                        lastWeekActualSaleRatio: (storSum - lastWeekSum) / lastWeekSum * 100,
                        yesterdayActualSaleRatio: (storSum - yesDaySum) / yesDaySum * 100,
                    });
                }
            });
        // console.log("result:"+JSON.stringify(result));

        return result;
    }, [saleList, appliedVatChecked, appliedDcChecked]);

    const handleVatExcludedToggle = () => {
        setVatExcludedChecked(!vatExcludedChecked);
    };
    const handleDcIncludedToggle = () => {
        setDcIncludedChecked(!dcIncludedChecked)
    }

    const renderHeader = () => {
        if (saleList.length == 0) return null;
        return (
            <View>
                {saleStatList.map(row => {
                    let saleValue1;
                    let saleValue2;

                    if (appliedVatChecked && appliedDcChecked) {
                        saleValue1 = row.saleAmt1 - row.vatAmt1;
                        saleValue2 = row.saleAmt2 - row.vatAmt2;

                    } //부가세 적용, DC적용 X

                    if (appliedVatChecked && !appliedDcChecked) {
                        saleValue1 = row.netSaleAmt1;
                        saleValue2 = row.netSaleAmt2;
                    } //부가세 적용, DC적용

                    if (!appliedVatChecked && appliedDcChecked) {
                        saleValue1 = row.saleAmt1;
                        saleValue2 = row.saleAmt2;
                    } //부가세 적용X, DC적용 X 총 매출

                    if (!appliedVatChecked && !appliedDcChecked) {
                        saleValue1 = row.actualSaleAmt1;
                        saleValue2 = row.actualSaleAmt2;
                    }
                    let lastWeekIsUp = saleValue1 > 0;
                    let yesDayIsUp = saleValue2 > 0;
                    // console.log('saleValue1:' + saleValue1 + ', saleValue2:' + saleValue2);
                    return (
                        <View
                            key={row.sortOrder}
                            style={[commonStyles.summaryRow,
                                {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 0,
                                    width: '100%',
                                },
                            ]}
                        >
                            <View style={[{flex: 1.9, justifyContent: 'center'},
                                commonStyles.columnContainer]}>
                                <Text style={[{textAlign:'center'}, commonStyles.cell,
                                    commonStyles.summaryLabelText]}>
                                    {row.label}
                                </Text>
                            </View>
                            <View style={[{flex: 3.3}]}>
                                {(row.sortOrder === '1') && (
                                    <View style={[commonStyles.columnContainer, {justifyContent:'flex-end'}]}>
                                        <Text style={commonStyles.numberCell}>
                                            {saleValue1.toLocaleString()} /</Text>
                                        <Text style={{color: '#444',fontSize: 12, textAlign:'right', paddingRight: 5}}>
                                            {saleValue2.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                                {(row.sortOrder === '2') && (
                                    <View style={[commonStyles.columnContainer, {justifyContent:'flex-end'}]}>
                                        <Text style={commonStyles.numberCell}>
                                            {saleValue1.toLocaleString()}
                                        </Text>
                                        <AntDesign
                                            name={lastWeekIsUp ? 'caretup' : 'caretdown'}
                                            size={13}
                                            color={lastWeekIsUp ? 'red' : 'blue'}
                                            style={{paddingRight: 5}}
                                        />
                                        <Text style={{fontSize: 12,
                                            color: '#444',
                                            paddingRight:5,
                                            textAlign: 'right'}}> /  {saleValue2.toLocaleString()}
                                        </Text>
                                        <AntDesign
                                            name={yesDayIsUp ? 'caretup' : 'caretdown'}
                                            size={13}
                                            color={yesDayIsUp ? 'red' : 'blue'}
                                            style={{paddingRight: 5}}
                                        />
                                    </View>
                                )}
                                {(row.sortOrder === '3') && (
                                    <View style={[commonStyles.columnContainer, {justifyContent:'flex-end'}]}>
                                        <Text style={commonStyles.numberCell}>
                                            {saleValue1.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }



    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.ALL}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>부가세별도</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleVatExcludedToggle}
                    >
                        <View style={[commonStyles.checkbox, vatExcludedChecked && commonStyles.checkboxChecked]}>
                            {vatExcludedChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>DC금액포함</Text>
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

            <Table
                data={selectedSalesOrgCd.length > 0 ? saleList : tableData}
                columns={mainColumns}
                listHeader={renderHeader}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
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
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}


