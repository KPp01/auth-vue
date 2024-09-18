<template>
    <div class="text-to-speech">
        <h3>AI-Powered Text-to-Speech</h3>
        <div class="tts-controls">
            <select v-model="selectedVoice">
                <option v-for="voice in availableVoices" :key="voice.voiceURI" :value="voice">
                    {{ voice.name }} ({{ voice.lang }})
                </option>
            </select>
            <div class="voice-settings">
                <label>
                    Speed:
                    <input type="range" v-model.number="speed" min="0.5" max="2" step="0.1" />
                    {{ speed.toFixed(1) }}x
                </label>
                <label>
                    Pitch:
                    <input type="range" v-model.number="pitch" min="0" max="2" step="0.1" />
                    {{ pitch.toFixed(1) }}
                </label>
            </div>
        </div>
        <textarea v-model="text" placeholder="Enter text to convert to speech"></textarea>
        <div class="action-buttons">
            <button @click="speakText" :disabled="!text || isSpeaking">
                {{ isSpeaking ? 'Speaking...' : 'Speak' }}
            </button>
            <button @click="pauseSpeech" :disabled="!isSpeaking">Pause</button>
            <button @click="resumeSpeech" :disabled="!isPaused">Resume</button>
            <button @click="stopSpeech" :disabled="!isSpeaking && !isPaused">Stop</button>
        </div>
        <div class="advanced-options">
            <h4>Advanced Options</h4>
            <label>
                <input type="checkbox" v-model="useNeuralVoice" /> Use Neural Voice (if available)
            </label>
            <label>
                <input type="checkbox" v-model="enableSSML" /> Enable SSML
            </label>
            <div v-if="enableSSML" class="ssml-editor">
                <textarea v-model="ssmlText" placeholder="Enter SSML"></textarea>
                <button @click="validateSSML">Validate SSML</button>
            </div>
        </div>
        <div class="audio-visualization">
            <canvas ref="visualizer"></canvas>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useTextToSpeechStore } from '@/stores/textToSpeechStore';

export default {
    name: 'TextToSpeech',
    setup() {
        const ttsStore = useTextToSpeechStore();
        const text = ref('');
        const selectedVoice = ref(null);
        const availableVoices = ref([]);
        const speed = ref(1);
        const pitch = ref(1);
        const isSpeaking = ref(false);
        const isPaused = ref(false);
        const useNeuralVoice = ref(false);
        const enableSSML = ref(false);
        const ssmlText = ref('');
        const visualizer = ref(null);

        let speechSynthesis = window.speechSynthesis;
        let audioContext, analyser, dataArray, source;

        const updateVoices = () => {
            availableVoices.value = speechSynthesis.getVoices();
            if (!selectedVoice.value && availableVoices.value.length > 0) {
                selectedVoice.value = availableVoices.value[0];
            }
        };

        onMounted(() => {
            updateVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = updateVoices;
            }

            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        });

        onUnmounted(() => {
            stopSpeech();
            if (audioContext) {
                audioContext.close();
            }
        });

        const speakText = () => {
            stopSpeech();
            isSpeaking.value = true;
            isPaused.value = false;

            const utterance = new SpeechSynthesisUtterance(enableSSML.value ? ssmlText.value : text.value);
            utterance.voice = selectedVoice.value;
            utterance.rate = speed.value;
            utterance.pitch = pitch.value;

            utterance.onend = () => {
                isSpeaking.value = false;
                isPaused.value = false;
            };

            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance error:', event);
                isSpeaking.value = false;
                isPaused.value = false;
            };

            if (useNeuralVoice.value) {
                utterance.voice = availableVoices.value.find(voice => voice.name.includes('Neural'));
            }

            speechSynthesis.speak(utterance);
            visualize();
        };

        const pauseSpeech = () => {
            if (speechSynthesis.speaking) {
                speechSynthesis.pause();
                isPaused.value = true;
            }
        };

        const resumeSpeech = () => {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                isPaused.value = false;
            }
        };

        const stopSpeech = () => {
            speechSynthesis.cancel();
            isSpeaking.value = false;
            isPaused.value = false;
        };

        const validateSSML = () => {
            // Implement SSML validation logic here
            console.log('Validating SSML:', ssmlText.value);
        };

        const visualize = () => {
            if (!visualizer.value) return;

            const canvas = visualizer.value;
            const canvasCtx = canvas.getContext('2d');

            if (!source) {
                source = audioContext.createMediaElementSource(new Audio());
                source.connect(analyser);
                analyser.connect(audioContext.destination);
            }

            function draw() {
                const WIDTH = canvas.width;
                const HEIGHT = canvas.height;

                requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

                const barWidth = (WIDTH / analyser.frequencyBinCount) * 2.5;
                let barHeight;
                let x = 0;

                for (let i = 0; i < analyser.frequencyBinCount; i++) {
                    barHeight = dataArray[i] / 2;

                    canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                    canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

                    x += barWidth + 1;
                }
            }

            draw();
        };

        watch(useNeuralVoice, (newValue) => {
            if (newValue) {
                const neuralVoice = availableVoices.value.find(voice => voice.name.includes('Neural'));
                if (neuralVoice) {
                    selectedVoice.value = neuralVoice;
                } else {
                    console.warn('Neural voice not available');
                    useNeuralVoice.value = false;
                }
            }
        });

        return {
            text,
            selectedVoice,
            availableVoices,
            speed,
            pitch,
            isSpeaking,
            isPaused,
            useNeuralVoice,
            enableSSML,
            ssmlText,
            visualizer,
            speakText,
            pauseSpeech,
            resumeSpeech,
            stopSpeech,
            validateSSML
        };
    }
};
</script>

<style scoped>
.text-to-speech {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h3 {
    color: #333;
    text-align: center;
}

.tts-controls {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

select,
input[type="range"] {
    width: 100%;
    margin-bottom: 10px;
}

.voice-settings {
    display: flex;
    flex-direction: column;
}

textarea {
    width: 100%;
    height: 150px;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover:not(:disabled) {
    background-color: #45a049;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.advanced-options {
    margin-top: 20px;
    padding: 20px;
    background-color: #e9e9e9;
    border-radius: 5px;
}

.ssml-editor {
    margin-top: 10px;
}

.ssml-editor textarea {
    height: 100px;
}

.audio-visualization {
    margin-top: 20px;
}

canvas {
    width: 100%;
    height: 100px;
    background-color: #333;
    border-radius: 5px;
}
</style>
