import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    Platform,
} from 'react-native';
import DateTimePicker, {
    DateTimePickerAndroid,
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {commonStyles} from "../styles/index";

interface DatePickerModal {
    visible: boolean;
    initialDate: Date;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    title?: string;
    pickerMode?: PickerMode
}

type PickerMode = 'date' | 'month';
export const DatePickerModal: React.FC<DatePickerModal> = ({
                                                               visible,
                                                               initialDate,
                                                               onClose,
                                                               onConfirm,
                                                               title = '조회일자 선택',
                                                               pickerMode = 'date',
                                                           }) => {
    const [tempDate, setTempDate] = React.useState<Date>(initialDate ?? new Date());

    React.useEffect(() => {
        setTempDate(initialDate ?? new Date());
    }, [initialDate, visible]);

    const openAndroidPicker = () => {
        DateTimePickerAndroid.open({
            value: tempDate,
            mode: 'date',
            display: 'calendar',
            onChange: (event: DateTimePickerEvent, date?: Date) => {
                if (event.type === 'set' && date) {
                    if (pickerMode === 'month') {
                        const y = date.getFullYear();
                        const m = date.getMonth();
                        setTempDate(new Date(y, m, 1));
                    } else {
                        setTempDate(date);
                    }
                    // Android는 즉시 confirm & 닫기
                    onConfirm(date);
                    onClose();
                } else if (event.type === 'dismissed') {
                    onClose();
                }
            },
        });
    };

    React.useEffect(() => {
        if (Platform.OS === 'android' && visible) {
            console.log('안드로이드 장비')
            openAndroidPicker();
        }
    }, [visible]);


    if (Platform.OS === 'android') {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={commonStyles.dateModalOverlay}>
                <View style={commonStyles.dateModalCard}>
                    <View style={commonStyles.dateModalHeader}>
                        <Text style={commonStyles.dateModalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={commonStyles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={commonStyles.dateModalPickerContainer}>
                        {tempDate instanceof Date && !isNaN(tempDate.getTime()) && (
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                                onChange={(event: DateTimePickerEvent, date?: Date) => {
                                    if (event.type === 'set' && date) {
                                        if (pickerMode === 'month') {
                                            const y = date.getFullYear();
                                            const m = date.getMonth();
                                            setTempDate(new Date(y, m, 1));
                                        } else {
                                            setTempDate(date);
                                        }
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View style={commonStyles.modalActions}>
                        <Pressable
                            style={commonStyles.modalOkButton}
                            onPress={() => {
                                if (tempDate) onConfirm(tempDate);
                                onClose();
                            }}
                        >
                            <Text style={commonStyles.dateModalOkButtonText}>확인</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
