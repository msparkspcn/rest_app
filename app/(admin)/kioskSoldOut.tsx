import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from '@/styles';
import {Table} from "../../components/Table";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import {Corner, User} from "../../types";

type ProductRow = { itemNm: string; useYn: 'Y' | 'N' };

export default function KioskSoldOutScreen() {
    const [cornerList, setCornerList] = useState<Corner[]>([]);

    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const {user}:User = useUser();

    useEffect(() => {
        console.log('user:'+JSON.stringify(user.cmpCd));
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd,
        }
        api.getCornerList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const cornerList = result.data.responseBody;
                    console.log('cornerList:' + JSON.stringify(cornerList))
                    setCornerList(cornerList);
                }
            })
            .catch(error => {
                console.log("getCornerList error:" + error)
            });
    },[])


    const productData: ProductRow[] = useMemo(
        () =>
            Array.from({length: 60}).map((_, index) => ({
                itemNm: `상품 ${index + 1}`,
                useYn: index % 3 === 0 ? 'N' : 'Y',
            })),
        []
    );

    const filteredData: ProductRow[] = useMemo(() => {
        return productData.map(
            (p, idx): ProductRow => ({
                ...p,
                useYn: (idx % 4 === 0 ? 'N' : 'Y') as 'Y' | 'N',
            })
        );
    }, [productData]);

    const onSearch = () => {
        if (selectedCornerCd == '') {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }
    };

    type Align = 'left' | 'center' | 'right';
    type ColumnDef<T> = {
        key: keyof T | string;
        title: string;
        flex: number;
        align?: Align;
        headerAlign?: Align;
        cellAlign?: Align;
    };
    const mainColumns: ColumnDef<ProductRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.3, align: 'center',
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {key: 'itemNm', title: '상품명', flex: 2, align: 'left'},
        {
            key: 'useYn', title: '사용여부', flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => updateSoldoutYn()}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {textAlign: 'center'}]}>
                        {item.useYn === 'Y' ? '출력' : '품절'}
                    </Text>
                </Pressable>
            ),
        },
    ]), []);

    const updateSoldoutYn = () => {
        Alert.alert('완료', '완료되었습니다.');
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity
                        style={commonStyles.selectInput}
                        onPress={() => setShowCornerModal(true)}
                    >
                        <Text style={[styles.selectText, !selectedCornerCd && styles.placeholderText]}>
                            {cornerList.find((s) => s.cornerCd === selectedCornerCd)?.cornerNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}>▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider}/>

            <Table data={filteredData} columns={mainColumns}/>

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

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    }
});
