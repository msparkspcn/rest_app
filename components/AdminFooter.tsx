import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../contexts/UserContext';

type AdminFooterProps = {
  onReset?: () => void;
  onLogoutPress?: () => void;
  onHome?: () => void;
};

export default function AdminFooter({ onReset, onLogoutPress, onHome }: AdminFooterProps) {
  const { logout } = useUser();
  const handleHome = () => {
    if(onHome) {
      console.log('home home')
      onHome()
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  }

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
    if (onLogoutPress) onLogoutPress();
  };

  return (
    <View style={styles.footer}>
      <Pressable style={styles.footerTextButton} onPress={handleHome} hitSlop={8}>
        <View style={styles.footerItemRow}>
          <Ionicons name="home-outline" size={16} color="#333" />
          <Text style={styles.footerText}>Home</Text>
        </View>
      </Pressable>
      <View style={styles.footerSeparator} />
      <Pressable style={styles.footerTextButton} onPress={handleReset} hitSlop={8}>
        <View style={styles.footerItemRow}>
          <Ionicons name="refresh" size={16} color="#333" />
          <Text style={styles.footerText}>초기화</Text>
        </View>
      </Pressable>
      <View style={styles.footerSeparator} />
      <Pressable style={styles.footerTextButton} onPress={handleLogout} hitSlop={8}>
        <View style={styles.footerItemRow}>
          <Ionicons name="log-out-outline" size={16} color="#FF3B30" />
          <Text style={[styles.footerText, styles.footerTextDanger]}>로그아웃</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'space-between',
  },
  footerTextButton: {
    paddingHorizontal: 20,
  },
  footerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerSeparator: {
    width: 1,
    height: 18,
    backgroundColor: '#b0b0b0',
    alignSelf: 'center',
  },
  footerText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  footerTextDanger: {
    color: '#FF3B30',
  },
});


