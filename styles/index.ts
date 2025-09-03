import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // backgroundColor: '#f5f5f5',
      },
      topBar: {
        paddingHorizontal: 10,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#f5f5f5',
      },
      filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      },
      filterLabel: {
        minWidth:50,
        fontSize: 14,
        color: '#555',
      },
      segmented: {
        flexDirection: 'row',
        backgroundColor: '#e8e8e8',
        borderRadius: 8,
        padding: 4,
      },
      segmentItem: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
      },
      segmentItemActive: {
        backgroundColor: '#007AFF',
      },
      segmentText: {
        fontSize: 14,
        color: '#333',
      },
      segmentTextActive: {
        color: '#fff',
        fontWeight: '600',
      },
      searchButton: {
        marginLeft: 'auto',
        backgroundColor: '#007AFF',
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 8,
      },
      searchButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
      },
      tableContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 10,
        marginHorizontal: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        elevation: 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
      },
      tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f0f3f7',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 8,
      },
      headerCell: {
        fontSize: 12,
        fontWeight: '700',
        color: '#333',
        width:'100%',
        textAlign: 'center',
      },
      tableRowEven: {
        backgroundColor: '#ffffff',
      },
      tableRowOdd: {
        backgroundColor: '#fafafa',
      },
      tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        paddingVertical: 8,
        // backgroundColor:'red'
      },
      columnContainer: {
        flexDirection: 'row',
        alignItems: 'center', // vertical center
        justifyContent: 'center',
        height: '100%',
        // backgroundColor:'red'
      },
      cellDivider: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#eee',
      },
      columnPressable: {
        flex: 1,
        justifyContent: 'center',
        // paddingLeft:10
      },
      alignLeft: {
        textAlign: 'left',
      },
      alignCenter: {
        textAlign: 'center',
      },
      alignRight: {
        textAlign: 'right',
      },
      cell: {
        fontSize: 12,
        color: '#444',
        width: '100%'
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
      },
      modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '80%',
        maxHeight: '80%',
      },
      modalCard: {
        width: '100%',
        maxWidth: 640,
        backgroundColor: '#fff',
        padding: 10,
        height: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        elevation: 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
      },
      modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
      },
      modalTableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#f0f3f7',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 8,
        paddingHorizontal: 10,
      },
      modalHeaderCell: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
      },
      modalTableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        paddingVertical: 8,
        paddingHorizontal: 10,
      },
      modalCell: {
        fontSize: 12,
        color: '#444',
      },
      modalTableContainer: {
        flex:1,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        backgroundColor: '#fff'
      },
      modalHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      },
      modalHeaderCellDivider: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#b0b0b0',
        paddingRight: 10,
        marginRight: 10,
      },
      modalColumnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
      },

      modalCellDivider: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#eee',
        paddingRight: 10,
      },
    sectionDivider: {
        height: 2,
        backgroundColor: '#b0b0b0',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        zIndex: 1,
      },
  dateModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
  },
  dateModalCard: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: '#fff',
      borderRadius: 12,
      overflow: 'hidden',
      height: '40%'
  },
  dateModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#eee'
  },
  dateModalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#333'
  },
  modalClose: {
      fontSize: 18,
      color: '#666'
  },
  dateModalPickerContainer: {
      alignItems: 'center'
  },
  modalActions: { padding: 12, alignItems: 'flex-end' },
  modalOkButton: {
      backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  dateModalOkButtonText: {
      color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  modalItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  modalItemText: { fontSize: 16, color: '#333' },
  modalOkButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  headerCellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#b0b0b0',
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  modalTableList: {
    flex: 1,
    marginTop: 2,
    backgroundColor: '#fff'
  },
  modalTableListContent: {
    paddingBottom: 8,
    backgroundColor: '#fff'
  },
  selectArrow: {
    fontSize: 12,
    color: '#666',
  },
  selectInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
})
