import React from 'react';
import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { commonStyles } from '@/styles';

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
    listHeader?: React.ReactNode
    listFooter?: React.ReactNode
};

const alignStyles = {
    left: { ...commonStyles.alignLeft, paddingLeft: 10 },
    center: commonStyles.alignCenter,
    right: { textAlign: 'right' },
} as const;

export function Table<T>({ data, columns, onRowPress, isModal, listHeader, listFooter }: TableProps<T>) {
    const renderHeader = () => (
        <View style={isModal ? commonStyles.modalTableHeaderRow : commonStyles.tableHeaderRow}>
            {columns.map((col, i) => (
                <View
                    key={String(col.key)}
                    style={[
                        { flex: col.flex },
                        isModal ? commonStyles.modalHeaderContainer : commonStyles.columnContainer,
                        i < columns.length - 1 &&
                        (isModal ? commonStyles.modalHeaderCellDivider : commonStyles.headerCellDivider),
                    ]}
                >
                    <Text style={isModal ? commonStyles.modalHeaderCell : commonStyles.headerCell}>
                        {col.title}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderItem = ({ item, index }: { item: T; index: number }) => {
        const rowContent = (
            <View style={[
                isModal ? commonStyles.modalTableRow : commonStyles.tableRow,
                index % 2 === 0 ? commonStyles.tableRowEven : commonStyles.tableRowOdd,
            ]}>
                {columns.map((col, i) => (
                    <View
                        key={String(col.key)}
                        style={[
                            { flex: col.flex },
                            commonStyles.columnContainer,
                            i < columns.length - 1 &&
                            (isModal ? commonStyles.modalCellDivider : commonStyles.cellDivider),
                        ]}
                    >
                        {col.renderCell ? (
                            col.renderCell(item, index)
                        ) : (
                            <Text
                                style={[
                                    {flex:1},
                                    isModal ? commonStyles.modalCell : commonStyles.cell,
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
    console.log("isModal:"+isModal)

    return (
        <View style={isModal ? commonStyles.modalTableContainer : commonStyles.tableContainer}>
            {renderHeader()}
            <FlatList
                data={data}
                keyExtractor={(item: T, index) => (item as any).no ? String((item as any).no) : String(index)}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                style={isModal ? commonStyles.modalTableList : styles.tableList}
                contentContainerStyle={isModal ? commonStyles.modalTableListContent : styles.tableListContent}
                bounces={false}
                alwaysBounceVertical={false}
                overScrollMode="never"
                showsVerticalScrollIndicator
            />
        </View>
    );
}

const styles = StyleSheet.create({
    tableList: { flex: 1, backgroundColor: '#fff' },
    tableListContent: { backgroundColor: '#fff' },
});
