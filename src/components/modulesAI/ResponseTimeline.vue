<template>
  <div class="response-timeline">
    <h3>Response Timeline</h3>
    <div class="timeline-container">
      <div v-for="(event, index) in sortedTimeline" :key="index" class="timeline-event">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <h4>{{ event.title }}</h4>
          <p>{{ event.description }}</p>
          <small>{{ formatTime(event.timestamp) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { format } from 'date-fns';

export default {
  name: 'ResponseTimeline',
  props: {
    responseEvents: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const timeline = ref([]);

    // Wykonanie po zamontowaniu komponentu
    onMounted(() => {
      timeline.value = props.responseEvents.map(event => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }));
    });

    // Posortowana oś czasu
    const sortedTimeline = computed(() => {
      return timeline.value.sort((a, b) => a.timestamp - b.timestamp);
    });

    // Formatowanie czasu do czytelnego formatu
    const formatTime = (timestamp) => {
      return format(timestamp, 'HH:mm:ss.SSS');
    };

    return {
      sortedTimeline,
      formatTime
    };
  }
};
</script>

<style scoped>
.response-timeline {
  margin-top: 20px;
}

.timeline-container {
  position: relative;
  padding-left: 30px;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #ddd;
}

.timeline-event {
  position: relative;
  margin-bottom: 20px;
}

.timeline-marker {
  position: absolute;
  left: -34px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #4CAF50;
  border: 2px solid #fff;
}

.timeline-content {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.timeline-content h4 {
  margin-top: 0;
  color: #333;
}

.timeline-content p {
  margin-bottom: 5px;
}

.timeline-content small {
  color: #777;
}
</style>
