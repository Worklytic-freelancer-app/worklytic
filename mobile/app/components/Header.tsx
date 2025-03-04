import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  rightComponent?: ReactNode;
  onRightComponentPress?: () => void;
}

export default function Header({
  title,
  rightComponent,
  onRightComponentPress,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightComponent ? (
        rightComponent
      ) : (
        <TouchableOpacity 
          style={styles.rightButton} 
          onPress={onRightComponentPress}
        >
          <Bell size={24} color="#374151" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});