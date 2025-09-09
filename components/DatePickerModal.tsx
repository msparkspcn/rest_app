import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    Platform,
} from 'react-native';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
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
    const [tempDate, setTempDate] = React.useState<Date>(initialDate);

    React.useEffect(() => {
        setTempDate(initialDate); // 모달 열 때마다 초기화
    }, [initialDate, visible]);

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
                        {tempDate && (
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
