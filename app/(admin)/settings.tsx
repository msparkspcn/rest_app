import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            console.log('로그아웃');
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            console.log('계정 삭제');
            // 여기에 계정 삭제 로직을 구현하세요
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: '알림 설정',
      items: [
        {
          title: '푸시 알림',
          subtitle: '새로운 활동에 대한 알림을 받습니다',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: '앱 설정',
      items: [
        {
          title: '다크 모드',
          subtitle: '어두운 테마를 사용합니다',
          type: 'switch',
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled,
        },
        {
          title: '자동 백업',
          subtitle: '데이터를 자동으로 백업합니다',
          type: 'switch',
          value: autoBackupEnabled,
          onValueChange: setAutoBackupEnabled,
        },
      ],
    },
    {
      title: '계정 정보',
      items: [
        {
          title: '이름',
          subtitle: '관리자',
          type: 'info',
        },
        {
          title: '이메일',
          subtitle: 'admin@example.com',
          type: 'info',
        },
        {
          title: '역할',
          subtitle: '관리자',
          type: 'info',
        },
        {
          title: '가입일',
          subtitle: '2024-01-01',
          type: 'info',
        },
      ],
    },
    {
      title: '계정 관리',
      items: [
        {
          title: '비밀번호 변경',
          subtitle: '계정 비밀번호를 변경합니다',
          type: 'action',
          onPress: () => console.log('비밀번호 변경'),
        },
        {
          title: '프로필 편집',
          subtitle: '개인 정보를 수정합니다',
          type: 'action',
          onPress: () => console.log('프로필 편집'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>설정</Text>
          <Text style={styles.subtitle}>앱 설정 및 계정 관리</Text>
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>

                {item.type === 'switch' && (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
                    thumbColor={item.value ? '#fff' : '#fff'}
                  />
                )}

                {item.type === 'action' && (
                  <TouchableOpacity onPress={item.onPress}>
                    <Text style={styles.actionText}>›</Text>
                  </TouchableOpacity>
                )}

                {item.type === 'info' && (
                  <Text style={styles.infoText}>{item.subtitle}</Text>
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>위험한 작업</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Text style={styles.dangerButtonText}>로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>계정 삭제</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>버전 1.0.0</Text>
        </View>
      </ScrollView>
      {/* 전역 레이아웃의 푸터를 사용합니다. */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionText: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  dangerSection: {
    marginBottom: 32,
  },
  dangerButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
