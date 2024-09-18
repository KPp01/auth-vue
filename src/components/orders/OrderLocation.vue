<template>
  <div class="order-location">
    <input
      id="pac-input"
      class="controls"
      type="text"
      placeholder="Wyszukaj lokalizację"
    />
    <select @change="changeMapType($event)" class="map-type-selector">
      <option value="roadmap">Mapa drogowa</option>
      <option value="satellite">Satelita</option>
      <option value="hybrid">Hybrydowa</option>
      <option value="terrain">Terenowa</option>
    </select>
    <div id="map" class="map"></div>
    <button @click="enableAddPin" class="add-pin-btn">Dodaj Pineskę</button>
    <button @click="clearMarkers" class="remove-all-btn">Usuń wszystkie pineski</button>
    <div v-if="markers.length > 0" class="marker-list">
      <h3>Lista Pinesek</h3>
      <ul>
        <li v-for="(marker, index) in markers" :key="index">
          <strong>{{ marker.title }}</strong> - {{ marker.address }}
          <br>Koordynaty: ({{ marker.position.lat }}, {{ marker.position.lng }})
          <button @click="removeMarker(index)">Usuń</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      map: null,
      geocoder: null,
      markers: [],
      markerBeingAdded: false,
      searchBox: null,
      lastCenter: null,
      lastZoom: 10,
    };
  },
  methods: {
    loadGoogleMaps() {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('API key is missing or undefined.');
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Google Maps API nie zostało poprawnie załadowane.');
      };
      document.head.appendChild(script);
    },
    initMap() {
      const mapCenter = this.lastCenter || { lat: 53.59149278201481, lng: 17.898647269517852 };

      this.map = new google.maps.Map(document.getElementById('map'), {
        center: mapCenter,
        zoom: this.lastZoom,
        mapTypeId: 'roadmap',
      });

      this.geocoder = new google.maps.Geocoder();
      this.map.addListener('click', (event) => {
        if (this.markerBeingAdded) {
          const latLng = event.latLng;
          this.geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              this.addMarker(latLng, results[0].formatted_address);
            } else {
              console.error('Błąd geokodowania: ' + status);
            }
          });
          this.markerBeingAdded = false;
        }
      });

      const input = document.getElementById('pac-input');
      this.searchBox = new google.maps.places.SearchBox(input);
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      this.searchBox.addListener('places_changed', () => {
        const places = this.searchBox.getPlaces();
        if (places.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
          if (!place.geometry || !place.geometry.location) return;

          const latLng = place.geometry.location;
          const address = place.formatted_address || place.name;
          this.addMarker(latLng, address);

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        this.map.fitBounds(bounds);
      });
    },
    enableAddPin() {
      this.markerBeingAdded = true;
    },
    addMarker(latLng, address) {
      const marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        title: `Pineska ${this.markers.length + 1}`,
      });
      const newMarker = {
        title: `Pineska ${this.markers.length + 1}`,
        position: { lat: latLng.lat(), lng: latLng.lng() },
        address: address,
        markerInstance: marker,
      };
      this.markers.push(newMarker);
      this.$emit('update:modelValue', { address, pins: this.markers });
    },
    removeMarker(index) {
      this.markers[index].markerInstance.setMap(null);
      this.markers.splice(index, 1);
      this.$emit('update:modelValue', { address: this.markers.length ? this.markers[0].address : '', pins: this.markers });
    },
    clearMarkers() {
      this.markers.forEach((marker) => marker.markerInstance.setMap(null));
      this.markers = [];
      this.$emit('update:modelValue', { address: '', pins: [] });
    },
    changeMapType(event) {
      this.map.setMapTypeId(event.target.value);
    },
  },
  mounted() {
    this.loadGoogleMaps();
    window.initMap = this.initMap;
  },
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 400px;
  margin-top: 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.add-pin-btn,
.remove-all-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-pin-btn:hover,
.remove-all-btn:hover {
  background-color: var(--primary-hover-color);
}

.marker-list {
  margin-top: 1rem;
}

.marker-list ul {
  list-style-type: none;
  padding: 0;
}

.marker-list li {
  margin-bottom: 0.5rem;
}

button {
  background-color: #ff6b6b;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  margin-left: 10px;
}

button:hover {
  background-color: #ff4c4c;
}

#pac-input {
  margin-top: 10px;
  padding: 5px;
  width: 300px;
}

.map-type-selector {
  margin-top: 10px;
  padding: 5px;
  width: 200px;
}
</style>
