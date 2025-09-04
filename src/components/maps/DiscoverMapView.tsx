import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { Circle, Meetup } from '../../types';




interface DiscoverMapViewProps {
  circles: Circle[];
  meetups: Meetup[];
  onCirclePress: (circleId: string) => void;
  onMeetupPress: (meetupId: string) => void;
}

const DiscoverMapView: React.FC<DiscoverMapViewProps> = ({
  circles,
  meetups,
  onCirclePress,
  onMeetupPress,
}) => {
  const mapRef = useRef<MapView>(null);


  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  // Default region (San Francisco Bay Area)
  const initialRegion: Region = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMarkerPress = (id: string, type: 'circle' | 'meetup') => {
    if (type === 'circle') {
      onCirclePress(id);
    } else {
      onMeetupPress(id);
    }
  };

  const handleMyLocation = () => {
    // In a real app, you'd use location services
    Alert.alert('Location', 'Location services would be implemented here');
  };

  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  const renderCircleMarkers = () => {
    return circles.map((circle) => {
      // For demo purposes, generate random coordinates around SF
      const latitude = 37.7749 + (Math.random() - 0.5) * 0.1;
      const longitude = -122.4194 + (Math.random() - 0.5) * 0.1;

      return (
        <Marker
          key={`circle-${circle.$id}`}
          coordinate={{ latitude, longitude }}
          onPress={() => handleMarkerPress(circle.$id, 'circle')}
        >
          <View style={styles.circleMarker}>
            <View style={styles.circleMarkerInner}>
              <Text style={styles.markerText}>C</Text>
            </View>
          </View>
          <Callout tooltip>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{circle.name}</Text>
              <Text style={styles.calloutSubtitle}>{circle.category}</Text>
              <Text style={styles.calloutMembers}>
                {circle.memberCount} members
              </Text>
            </View>
          </Callout>
        </Marker>
      );
    });
  };

  const renderMeetupMarkers = () => {
    return meetups.map((meetup) => {
      // Use meetup location if available, otherwise generate random coordinates
      const latitude = meetup.location.coordinates?.latitude || 
        (37.7749 + (Math.random() - 0.5) * 0.1);
      const longitude = meetup.location.coordinates?.longitude || 
        (-122.4194 + (Math.random() - 0.5) * 0.1);

      return (
        <Marker
          key={`meetup-${meetup.$id}`}
          coordinate={{ latitude, longitude }}
          onPress={() => handleMarkerPress(meetup.$id, 'meetup')}
        >
          <View style={styles.meetupMarker}>
            <View style={styles.meetupMarkerInner}>
              <Text style={styles.markerText}>M</Text>
            </View>
          </View>
          <Callout tooltip>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{meetup.title}</Text>
              <Text style={styles.calloutSubtitle}>
                {new Date(meetup.date).toLocaleDateString()}
              </Text>
              <Text style={styles.calloutMembers}>
                {meetup.currentAttendees} attending
              </Text>
            </View>
          </Callout>
        </Marker>
      );
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        onPress={() => {}}
      >
        {renderCircleMarkers()}
        {renderMeetupMarkers()}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleMyLocation}>
          <Text style={styles.controlIcon}>📍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Text style={styles.controlIcon}>🛰️</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, styles.circleMarker]}>
            <View style={styles.circleMarkerInner}>
              <Text style={styles.legendMarkerText}>C</Text>
            </View>
          </View>
          <Text style={styles.legendText}>Circles</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, styles.meetupMarker]}>
            <View style={styles.meetupMarkerInner}>
              <Text style={styles.legendMarkerText}>M</Text>
            </View>
          </View>
          <Text style={styles.legendText}>Meetups</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {circles.length} circles • {meetups.length} meetups
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 60,
    right: 16,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlIcon: {
    fontSize: 18,
  },
  circleMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  circleMarkerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetupMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  meetupMarkerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  calloutMembers: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  legend: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendMarkerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
  stats: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});

export default DiscoverMapView;
