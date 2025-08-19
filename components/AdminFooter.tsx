import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type AdminFooterProps = {
  onReset?: () => void;
  onLogoutPress?: () => void;
};

export default function AdminFooter({ onReset, onLogoutPress }: AdminFooterProps) {
  const handleHome = () => router.push('/');
  const handleReset = () => onReset && onReset();
  const handleLogout = () => (onLogoutPress ? onLogoutPress() : console.log('로그아웃'));

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
    paddingVertical: 10,
    marginHorizontal: 20,
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


