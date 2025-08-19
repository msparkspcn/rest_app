import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function UsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const users = [
    {
      id: 1,
      name: '김철수',
      email: 'kim@example.com',
      status: 'active',
      role: 'user',
      joinDate: '2024-01-15',
    },
    {
      id: 2,
      name: '이영희',
      email: 'lee@example.com',
      status: 'active',
      role: 'user',
      joinDate: '2024-01-20',
    },
    {
      id: 3,
      name: '박민수',
      email: 'park@example.com',
      status: 'suspended',
      role: 'user',
      joinDate: '2024-01-10',
    },
    {
      id: 4,
      name: '정수진',
      email: 'jung@example.com',
      status: 'active',
      role: 'admin',
      joinDate: '2024-01-05',
    },
    {
      id: 5,
      name: '최동욱',
      email: 'choi@example.com',
      status: 'inactive',
      role: 'user',
      joinDate: '2024-01-25',
    },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'suspended':
        return '#FF9500';
      case 'inactive':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'suspended':
        return '정지';
      case 'inactive':
        return '비활성';
      default:
        return '알 수 없음';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'user':
        return '사용자';
      default:
        return '사용자';
    }
  };

  const handleUserAction = (userId: number, action: string) => {
    console.log(`${action} for user ${userId}`);
    // 여기에 실제 사용자 관리 로직을 구현하세요
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>사용자 관리</Text>
          <Text style={styles.subtitle}>총 {users.length}명의 사용자</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="사용자 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.filter(u => u.status === 'active').length}</Text>
            <Text style={styles.statLabel}>활성 사용자</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.filter(u => u.status === 'suspended').length}</Text>
            <Text style={styles.statLabel}>정지된 사용자</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.filter(u => u.role === 'admin').length}</Text>
            <Text style={styles.statLabel}>관리자</Text>
          </View>
        </View>

        <View style={styles.usersContainer}>
          <Text style={styles.sectionTitle}>사용자 목록</Text>
          
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(user.status) }
                  ]}>
                    <Text style={styles.statusText}>{getStatusText(user.status)}</Text>
                  </View>
                </View>
                
                <Text style={styles.userEmail}>{user.email}</Text>
                
                <View style={styles.userDetails}>
                  <Text style={styles.userRole}>{getRoleText(user.role)}</Text>
                  <Text style={styles.userDate}>가입일: {user.joinDate}</Text>
                </View>
              </View>
              
              <View style={styles.userActions}>
                {user.status === 'active' ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.suspendButton]}
                    onPress={() => handleUserAction(user.id, 'suspend')}
                  >
                    <Text style={styles.suspendButtonText}>정지</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.activateButton]}
                    onPress={() => handleUserAction(user.id, 'activate')}
                  >
                    <Text style={styles.activateButtonText}>활성화</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleUserAction(user.id, 'delete')}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    marginBottom: 24,
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
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  usersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userRole: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  suspendButton: {
    backgroundColor: '#FF9500',
  },
  suspendButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  activateButton: {
    backgroundColor: '#34C759',
  },
  activateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
