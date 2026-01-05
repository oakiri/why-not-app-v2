import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/theme';

const DONENESS_OPTIONS = [
  { id: 'rare', label: 'Poco hecho', color: '#8B0000', description: 'Rojo e intenso' },
  { id: 'medium-rare', label: 'Al punto menos', color: '#B22222', description: 'Rosado y jugoso' },
  { id: 'medium', label: 'Al punto', color: '#CD5C5C', description: 'Equilibrado' },
  { id: 'medium-well', label: 'Al punto más', color: '#BC8F8F', description: 'Casi hecho' },
  { id: 'well-done', label: 'Muy hecho', color: '#8B4513', description: 'Bien cocinado' },
];

export default function MeatDonenessSelector({ selected, onSelect }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿CÓMO QUIERES LA CARNE?</Text>
      <View style={styles.grid}>
        {DONENESS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selected === option.id && styles.selectedOption,
              { borderLeftColor: option.color }
            ]}
            onPress={() => onSelect(option.id)}
          >
            <View>
              <Text style={[styles.label, selected === option.id && styles.selectedText]}>
                {option.label.toUpperCase()}
              </Text>
              <Text style={styles.description}>{option.description}</Text>
            </View>
            {selected === option.id && (
              <View style={[styles.indicator, { backgroundColor: option.color }]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 20 },
  title: { fontFamily: 'Anton', fontSize: 16, color: '#000', marginBottom: 12, letterSpacing: 1 },
  grid: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
  },
  selectedOption: {
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: { fontFamily: 'Anton', fontSize: 14, color: '#666' },
  selectedText: { color: '#000' },
  description: { fontFamily: 'Anton', fontSize: 11, color: '#999', marginTop: 2 },
  indicator: { width: 12, height: 12, borderRadius: 6 },
});
