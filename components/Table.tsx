import React from 'react';
import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { commonStyles } from '@/styles';
import Const from "../constants/Const";
import {AntDesign} from "@expo/vector-icons";

type Align = 'left' | 'center' | 'right';
type ColumnDef<T> = {
    key: keyof T | string;
    title: string;
    flex: number;
    align?: Align;
    headerAlign?: Align;
    cellAlign?: Align;
    renderCell?: (item: T, index?: number) => React.ReactNode;
};

type TableProps<T> = {
    data: T[];
    columns: ColumnDef<T>[];
    onRowPress?: (item: T) => void;
    isModal?: boolean; // 모달 내부에 사용되는지 여부
    listHeader?: React.ReactNode;
    listFooter?: React.ReactNode;
};

const alignStyles = {
    left: { ...commonStyles.alignLeft, paddingLeft: 5 },
    center: commonStyles.alignCenter,
    right: { textAlign: 'right' },
} as const;

export function Table<T>({
     data,
     columns,
     onRowPress,
     isModal,
     listHeader,
     listFooter
}: TableProps<T>) {
    const renderHeader = () => (
        <View style={commonStyles.tableHeaderRow}>
            {columns.map((col, i) => (
                <View
                    key={String(col.key)}
                    style={[
                        { flex: col.flex },
                        commonStyles.columnContainer,
                        // i === columns.length - 1 && { borderRightWidth: 0}
                    ]}
                >
                    <Text style={commonStyles.headerCell}>
                        {col.title}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderItem = ({ item, index }: { item: T; index: number }) => {
        if ((item as any).isSummary) {
            const summaryItem = item as any; // 타입 단순화
            return (
                <View style={[commonStyles.summaryRow,

                ]}>
                    <View style={[{flex: 2.5}, commonStyles.columnContainer]}>
                        <Text style={[commonStyles.summaryLabelText,
                            {textAlign: 'center', fontSize: 13 }]}>
                            {summaryItem.orgNm}
                        </Text>
                    </View>
                    {summaryItem.saleQty && (
                        <View style={[{flex: 1.1}, commonStyles.columnContainer]}>
                            <Text style={[commonStyles.numberSmallCell]}>
                                {summaryItem.saleQty.toLocaleString()}
                            </Text>
                        </View>
                    )}
                    <View style={[{flex: 1.5}, commonStyles.columnContainer]}>
                        <Text style={[commonStyles.numberSmallCell]}>
                            {summaryItem.totalSaleAmt.toLocaleString()}
                        </Text>
                    </View>
                </View>
            );
        }
        if ((item as any).isRatioSummary) {
            const summaryItem = item as any; // 타입 단순화
            return (
                <View style={[commonStyles.summaryRow]}>
                    <View style={[{flex: 1.9}, commonStyles.columnContainer]}>
                        <Text style={[{textAlign:'center'}, commonStyles.cell, commonStyles.summaryLabelText]}>
                            {summaryItem.orgNm}
                        </Text>
                    </View>
                    <View style={[commonStyles.columnContainer,
                        {flex: 1, justifyContent:'flex-end'}]}
                    >
                        <Text style={commonStyles.numberCell}>
                            {summaryItem.lastWeekActualSaleRatio.toLocaleString()}
                        </Text>
                        <AntDesign
                            name={summaryItem.lastWeekActualSaleRatio>0 ? 'caretup' : 'caretdown'}
                            size={13}
                            color={summaryItem.lastWeekActualSaleRatio>0 ? 'red' : 'blue'}
                            style={{marginRight: 2}}
                        />
                    </View>
                    <View style={[commonStyles.columnContainer,
                        {flex: 1, justifyContent:'flex-end'}]}
                    >
                        <Text style={commonStyles.numberCell}>
                            {summaryItem.yesterdayActualSaleRatio.toLocaleString()}
                        </Text>
                        <AntDesign
                            name={summaryItem.yesterdayActualSaleRatio > 0 ? 'caretup' : 'caretdown'}
                            size={13}
                            color={summaryItem.yesterdayActualSaleRatio > 0 ? 'red' : 'blue'}
                            style={{marginRight: 2}}
                        />
                    </View>
                    <View style={[{flex: 1.3}, commonStyles.columnContainer]}>
                        <Text style={[commonStyles.numberSmallCell]}>
                            {summaryItem.actualSaleAmt.toLocaleString()}
                        </Text>
                    </View>
                </View>
            );
        }
        if ((item as any).isPurchaseSummary) {
            const summaryItem = item as any; // 타입 단순화
            return (
                <View style={[commonStyles.summaryRow,
                    {borderBottomWidth: '3', borderColor:'#aaa'},
                ]}>
                    <View style={[{flex: 2.5}, commonStyles.columnContainer]}>
                        <Text style={[commonStyles.summaryLabelText,
                            {textAlign: 'center', fontSize: 13 }]}>
                            {summaryItem.salesOrgNm}
                        </Text>
                    </View>
                    <View style={[{flex: 1}, commonStyles.columnContainer]}>
                        <Text style={[commonStyles.numberSmallCell]}>
                            {summaryItem.totalOrdAmt.toLocaleString()}
                        </Text>
                    </View>
                </View>
            );
        }

        const rowContent = (
            <View style={[
                commonStyles.tableRow,
                index % 2 === 0 ? commonStyles.tableRowEven : commonStyles.tableRowOdd,
            ]}>
                {columns.map((col, i) => (
                    <View
                        key={String(col.key)}
                        style={[{ flex: col.flex },
                            commonStyles.columnContainer
                        ]}
                    >
                        {col.renderCell ? (
                            col.renderCell(item, index)
                        ) : (
                            <Text
                                style={[
                                    {flex:1},
                                    commonStyles.cell,
                                    alignStyles[col.cellAlign ?? col.align ?? 'left'],
                                ]}
                            >
                                {(item as any)[col.key]}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        );

        if (onRowPress) {
            return <Pressable onPress={() => onRowPress(item)}>{rowContent}</Pressable>;
        }
        return rowContent;
    };

    return (
        <View style={[commonStyles.tableContainer]}>
            {renderHeader()}
            <FlatList
                data={data}
                keyExtractor={(item: T, index) => (item as any).no ? String((item as any).no) : String(index)}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListFooterComponent={(data ?? []).length > 0 ? listFooter : null}
                ListEmptyComponent={
                    <View style={commonStyles.listEmptyComponent}>
                        <Text style={{ color: '#888' }}>
                            {data === null ? Const.ENTER_SEARCH_COND_MSG : Const.NO_RESULT_MSG}
                        </Text>
                    </View>
                }
                contentContainerStyle={[isModal ? commonStyles.modalTableListContent : styles.tableListContent,
                { paddingHorizontal: 0, paddingLeft: 0 }
                ]}
                bounces={false}
                alwaysBounceVertical={false}
                overScrollMode="never"
                showsVerticalScrollIndicator
            />
        </View>
    );
};

const styles = StyleSheet.create({
    tableListContent: { backgroundColor: '#fff' },
});
