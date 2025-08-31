import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type VendorRow = {
  no: number;
  vendor: string;
  status: '등록' | '취소';
};

type RegisterFilter = '전체' | '등록' | '취소';

export default function VendorListScreen() {
  const [vendorQuery, setVendorQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>('전체');
  const [submitted, setSubmitted] = useState<{ q: string; f: RegisterFilter }>({ q: '', f: '전체' });
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorRow | null>(null);

  const baseData: VendorRow[] = useMemo(() => {
    return Array.from({ length: 20 }).map((_, index) => ({
      no: index + 1,
      vendor: `거래처 ${String(index + 1).padStart(2, '0')}`,
      status: index % 2 === 0 ? '등록' : '취소',
    }));
  }, []);

  const filteredData = useMemo(() => {
    const { q, f } = submitted;
    return baseData
      .filter((row) => (f === '전체' ? true : row.status === f))
      .filter((row) => (q.trim().length === 0 ? true : row.vendor.includes(q.trim())));
  }, [baseData, submitted]);

  const onSearch = () => {
    setSubmitted({ q: vendorQuery, f: registerFilter });
  };

  const openDetail = (vendor: VendorRow) => {
    setSelectedVendor(vendor);
    setIsDetailVisible(true);
  };

  const closeDetail = () => {
    setIsDetailVisible(false);
  };

  type VendorDetailRow = { no: number; itemCd: string; itemNm: string };
  const detailData: VendorDetailRow[] = useMemo(
    () =>
      Array.from({ length: 120 }).map((_, index) => ({
        no: index + 1,
        itemCd: `C${1000 + index}`,
        itemNm: `명칭 ${index + 1}`,
      })),
    [] 
  );

  const vendorColumns: ColumnDef<VendorDetailRow>[] = useMemo(() => ([
    { key: 'no', title: 'No',     flex: 0.7, align: 'center' },
    { key: 'itemCd', title: '상품코드',  flex: 1.4, align: 'left' },
    { key: 'itemNm', title: '상품명',   flex: 2.2, align: 'left'   }, 
  ]), []); 

  const renderDetailHeader = () => (
    <View style={commonStyles.modalTableHeaderRow}>
      {vendorColumns.map((col, i) => (
        <View
          key={String(col.key)}
          style={[
            { flex: col.flex },
            commonStyles.modalHeaderContainer,
            i < vendorColumns.length - 1 && commonStyles.modalHeaderCellDivider,
          ]}
          >
            <Text
            style={[
              commonStyles.modalHeaderCell,
              alignStyles[col.headerAlign ?? col.align ?? 'left'],
            ]}
          >
            {col.title}
          </Text>
          </View>
      ))}
    </View> 
  );

  type Align = 'left' | 'center' | 'right';
  type ColumnDef<T> = {
    key: keyof T | string;
    title: string;
    flex: number;
    align?: Align; // default align for both header and cell
    headerAlign?: Align; // overrides header align
    cellAlign?: Align;   // overrides cell align
  };

  const renderDetailItem = ({ item, index }: { item: VendorDetailRow, index: number }) => (
    <View style={[commonStyles.modalTableRow, index % 2 === 0 ? commonStyles.tableRowEven : commonStyles.tableRowOdd]}>
      {vendorColumns.map((col, i) => {
        const alignment = col.cellAlign ?? col.align ?? 'left';
        console.log('item:'+item.itemNm)
        return (
        <View
          key={String(col.key)}
          style={[
            { flex: col.flex },
            commonStyles.modalColumnContainer,
            i < vendorColumns.length - 1 && commonStyles.modalCellDivider,
          ]}
        >
          <Text
            style={[
              commonStyles.modalCell,
              { textAlign: alignment },
            ]}
          > 
            {(item as any)[col.key]}
          </Text>
        </View>
        )
      })}
    </View>
  ); 

  const mainColumns: ColumnDef<VendorRow>[] = useMemo(() => ([
    { key: 'no',       title: 'No',     flex: 0.3, align: 'center' },
    { key: 'vendor',     title: '거래처',   flex: 2,   align: 'left'   },
    { key: 'status',     title: '상태',    flex: 0.8, align: 'center' },
  ]), []);

  const alignStyles = {
    left: commonStyles.alignLeft,
    center: commonStyles.alignCenter,
    right: commonStyles.alignRight,
  } as const;

  const renderHeader = () => (
    <View style={commonStyles.tableHeaderRow}>
      <Text style={[commonStyles.headerCell, styles.colNo]}>No</Text>
      <Text style={[commonStyles.headerCell, styles.colVendor]}>거래처</Text>
      <Text style={[commonStyles.headerCell, styles.colStatus]}>상태</Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: VendorRow; index: number }) => (
    <View style={[commonStyles.tableRow, index % 2 === 0 ? commonStyles.tableRowEven : commonStyles.tableRowOdd]}>
      {mainColumns.map((col, i) => {
        const value = col.key === 'status' ? (item.status === 'Y' ? '등록' : '취소') 
        : (item as any)[col.key];
        return (
          <View
            key={String(col.key)}
            style={[ 
              { flex: col.flex },
              commonStyles.columnContainer,
              i < mainColumns.length - 1 && commonStyles.cellDivider,
            ]}
          >
            {col.key === 'vendor' ? (
              <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                <Text
                  style={[
                    commonStyles.cell,
                    alignStyles[col.cellAlign ?? col.align ?? 'left'],
                    styles.linkText,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ) : (
              <Text
                style={[
                  commonStyles.cell,
                  alignStyles[col.cellAlign ?? col.align ?? 'left'],
                ]}
              >
                {value}
              </Text>
            )}
            </View>
        ) 
      })}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar style="dark" />

      <View style={commonStyles.topBar}>
        <View style={[commonStyles.filterRow, styles.filterRowSpacing]}>
          <Text style={commonStyles.filterLabel}>거래처</Text>
          <TextInput
            style={styles.input}
            placeholder="거래처 입력"
            placeholderTextColor="#999"
            value={vendorQuery}
            onChangeText={setVendorQuery}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>

        {/* 2행: 등록여부 + 조회 */}
        <View style={commonStyles.filterRow}>
          <Text style={commonStyles.filterLabel}>등록여부</Text>
          <View style={commonStyles.segmented}>
            {(['전체', '등록', '취소'] as RegisterFilter[]).map((option) => (
              <Pressable
                key={option} 
                onPress={() => setRegisterFilter(option)}
                style={[commonStyles.segmentItem, registerFilter === option && commonStyles.segmentItemActive]}
              >
                <Text style={[commonStyles.segmentText, registerFilter === option && commonStyles.segmentTextActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={commonStyles.searchButton} onPress={onSearch}>
            <Text style={commonStyles.searchButtonText}>조회</Text>
          </Pressable>
        </View>
      </View>

      <View style={commonStyles.sectionDivider} />

      {/* 그리드 영역 */}
      <View style={commonStyles.tableContainer}>
        {renderHeader()}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => String(item.no)}
          renderItem={renderItem}
          style={styles.tableList}
          contentContainerStyle={styles.tableListContent}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          showsVerticalScrollIndicator
        />
      </View>

      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>거래처 상세</Text>
              <Pressable onPress={closeDetail} hitSlop={8}>
                <Ionicons name="close" size={20} color="#333" />
              </Pressable>
            </View>

            <View style={commonStyles.modalTableContainer}>
            {renderDetailHeader()} 
            {selectedVendor && (
              <Text style={styles.modalStoreName}>{selectedVendor.vendor}</Text>
            )}

            <FlatList
              data={detailData}
              keyExtractor={(item) => String(item.no)}
              renderItem={renderDetailItem}
              style={styles.modalTableList}
              contentContainerStyle={styles.modalTableListContent}
              showsVerticalScrollIndicator
            />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRowSpacing: {
    marginBottom: 10,
  },
  
  filterLabelSpacing: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
  },

  tableList: {
    flex: 1,
    backgroundColor: '#fff'
  },
  tableListContent: {
  },


  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  colNo: {
    flex: 0.8,
  },
  colVendor: {
    flex: 2,
  },
  colStatus: {
    flex: 1,
  },
  vendorNamePressable: {
    flex: 2,
  },

  // Modal
  
  modalStoreName: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  modalTableList: {
    flex: 1,
    marginTop: 2,
  },
  modalTableListContent: {
    paddingBottom: 8,
  },

});


