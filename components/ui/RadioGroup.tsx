import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {commonStyles} from "../../styles/index";

interface Option {
    label: string;
    value: string;
}
interface RadioGroupProps {
    options: Option[];
    selected: string;
    onChange: (value: string) => void;
}

export default function MyRadioGroup({ options, selected, onChange }: RadioGroupProps) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {options.map(option => {
                const isSelected = selected === option.value;
                return (
                    <View key={option.value} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
                        {/* 라디오 버튼 영역만 터치 가능 */}
                        <TouchableOpacity onPress={() => onChange(option.value)} activeOpacity={0.7}>
                            <View
                                style={{
                                    height: 15,
                                    width: 15,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: isSelected ? '#007AFF' : '#333',
                                    backgroundColor: isSelected ? '#007AFF' : 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {isSelected && (
                                    <View
                                        style={{
                                            height: 7,
                                            width: 7,
                                            borderRadius: 5,
                                            backgroundColor: 'white',
                                        }}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 4 }}>{option.label}</Text>
                    </View>
                );
            })}
        </View>
    );
}
