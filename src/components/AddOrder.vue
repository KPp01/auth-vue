<template>
    <body v-bind:class="{ dark: isDarkMode, light: !isDarkMode }">
      <div>
        <button @click="toggleTheme" class="theme-toggle-btn">
          <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i> Zmień motyw
        </button>
        <div class="add-order">
          <h1>Dodaj Nowe Zlecenie</h1>
          <form @submit.prevent="addOrder">
            <div class="p-field">
              <label for="orderNumber">Numer Zlecenia</label>
              <InputText id="orderNumber" v-model="orderNumber" disabled />
            </div>
            <div class="p-field">
              <label for="orderName">Nazwa Zlecenia</label>
              <div class="input-container">
                <InputText id="orderName" v-model="form.orderName" placeholder="Wprowadź nazwę zlecenia" />
              </div>
            </div>
            <div class="p-field" v-if="isBoss">
              <label for="clientData">Dane Klienta</label>
              <div class="input-container">
                <InputText id="clientData" v-model="form.clientData" placeholder="Wprowadź dane klienta" />
              </div>
            </div>
            <div class="p-field">
              <label for="assignedUsers">Osoby Realizujące</label>
              <div v-for="(user, index) in form.assignedUsers" :key="user.id" class="user-item">
                <span>{{ user.name }}</span>
                <Button icon="pi pi-minus" @click="removeUser(index)" />
              </div>
              <MultiSelect v-model="selectedUser" :options="users" optionLabel="name" placeholder="Wybierz użytkownika" :max-selected-labels="1" @change="addUser" />
            </div>
            <div class="p-field">
              <label for="startDate">Data Rozpoczęcia</label>
              <input type="datetime-local" id="startDate" v-model="form.startDate" />
            </div>
            <div class="p-field">
              <label for="endDate">Data Zakończenia</label>
              <input type="datetime-local" id="endDate" v-model="form.endDate" />
            </div>
            <div class="p-field" v-if="isBoss">
              <label for="address">Adres Zlecenia</label>
              <div class="input-container">
                <InputText id="address" v-model="form.address" ref="addressInput" placeholder="Wprowadź adres zlecenia" />
                <Button icon="pi pi-search" @click="searchAddress" />
              </div>
              <div id="map"></div>
              <div class="map-buttons">
                <Button @click="enableAddPin">Dodaj pineskę</Button>
                <Button @click="removePin">Usuń pineskę</Button>
              </div>
              <div v-if="pinAddress" class="pin-details">
                <p>Adres: {{ pinAddress }}</p>
                <p>Koordynaty: {{ pinCoords.lat }}, {{ pinCoords.lng }}</p>
              </div>
            </div>
            <div class="p-field">
              <label for="mainTasks">Szczegóły Zadania</label>
              <div v-for="(task, taskIndex) in form.mainTasks" :key="taskIndex">
                <div class="task-item full-width">
                  <Textarea v-model="task.task" placeholder="Wprowadź szczegóły głównego zadania" rows="3" @keydown.enter.exact="addMainTask(taskIndex)" @keydown.shift.enter.exact.prevent="expandText($event)" />
                  <Button icon="pi pi-minus" @click="removeMainTask(taskIndex)" />
                </div>
                <div class="subtasks full-width">
                  <label for="subTasks">Podpunkty</label>
                  <div v-for="(subTask, index) in task.subTasks" :key="index" class="subtask-item">
                    <div class="input-container">
                      <Textarea :id="'subTask-' + taskIndex + '-' + index" v-model="task.subTasks[index]" placeholder="Wprowadź podpunkt" rows="3" @keydown.enter.exact="addSubTask(taskIndex, index)" @keydown.shift.enter.exact.prevent="expandText($event)" />
                      <Button icon="pi pi-minus" @click="removeSubTask(taskIndex, index)" />
                    </div>
                  </div>
                  <Button type="button" @click="addSubTask(taskIndex)">Dodaj podpunkt</Button>
                </div>
              </div>
              <Button type="button" @click="addMainTask">Dodaj zadanie</Button>
            </div>
            <div class="p-field">
              <label for="materials">Potrzebne Materiały</label>
              <div v-for="(material, index) in form.materials" :key="index" class="material-item">
                <Textarea v-model="form.materials[index]" placeholder="Wprowadź materiał" rows="3" @keydown.enter.exact="addMaterial" @keydown.shift.enter.exact.prevent="expandText($event)" />
                <Button icon="pi pi-minus" @click="removeMaterial(index)" />
              </div>
              <Button type="button" @click="addMaterial">Dodaj materiał</Button>
            </div>
            <div class="p-field">
              <label for="tools">Potrzebne Narzędzia</label>
              <div v-for="(tool, index) in form.tools" :key="index" class="tool-item">
                <Textarea v-model="form.tools[index]" placeholder="Wprowadź narzędzie" rows="3" @keydown.enter.exact="addTool" @keydown.shift.enter.exact.prevent="expandText($event)" />
                <Button icon="pi pi-minus" @click="removeTool(index)" />
              </div>
              <Button type="button" @click="addTool">Dodaj narzędzie</Button>
            </div>
            <div class="p-field">
              <label for="files">Załączniki</label>
              <div v-for="(file, index) in form.files" :key="index" class="file-item">
                <input type="file" @change="handleFileUpload($event, index)" />
                <Button icon="pi pi-minus" @click="removeFile(index)" />
              </div>
              <Button type="button" @click="addFile">Dodaj załącznik</Button>
            </div>
            <Button label="Dodaj Zlecenie" @click="addOrder" :disabled="isSubmitting"></Button>
          </form>
          <Toast ref="toast" />
        </div>
      </div>
    </body>
  </template>
 <script>
 import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
 import { collection, addDoc, getDocs, getDoc, doc, updateDoc, setDoc, query, where, orderBy, limit } from 'firebase/firestore';
 import { db, storage } from '@/main';
 import { useStore } from 'vuex';
 import { ref as storageRef, uploadBytes } from 'firebase/storage';
 import InputText from 'primevue/inputtext';
 import Textarea from 'primevue/textarea';
 import Button from 'primevue/button';
 import Toast from 'primevue/toast';
 import MultiSelect from 'primevue/multiselect';
 
 export default {
   name: 'AddOrder',
   components: {
     InputText,
     Textarea,
     Button,
     Toast,
     MultiSelect
   },
   setup() {
     const store = useStore();
     const form = reactive({
       orderName: '',
       clientData: '',
       assignedUsers: [],
       startDate: null,
       endDate: null,
       address: '',
       mainTasks: [{ task: '', subTasks: [''] }],
       materials: [''],
       tools: [''],
       files: [{ file: null }]
     });
     const apiKey = ref(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
     const orderNumber = ref('');
     const isSubmitting = ref(false);
     const users = ref([]);
     const selectedUser = ref([]);
     const isBoss = computed(() => store.state.user.permissions === 'Manager');
     const isDarkMode = ref(false);
     const userId = store.state.user.id;
     const themeDocRef = doc(db, 'users', userId, 'preferences', 'theme');
     const toastRef = ref(null);
     const map = ref(null);
     const marker = ref(null);
     const addingPin = ref(false);
     const pinAddress = ref('');
     const pinCoords = reactive({ lat: null, lng: null });
 
     const fetchUsers = async () => {
       const q = query(collection(db, 'users'), where('permissions', '==', 'Worker'));
       const querySnapshot = await getDocs(q);
       users.value = querySnapshot.docs.map(doc => ({ id: doc.id, name: `${doc.data().firstName} ${doc.data().lastName}` }));
     };
 
     const generateOrderNumber = async () => {
       const currentYear = new Date().getFullYear().toString();
       const q = query(
         collection(db, 'orders'),
         where('orderNumber', '>=', `${currentYear}/`),
         where('orderNumber', '<', `${parseInt(currentYear) + 1}/`),
         orderBy('orderNumber', 'desc'),
         limit(1)
       );
 
       const querySnapshot = await getDocs(q);
       if (!querySnapshot.empty) {
         const lastOrder = querySnapshot.docs[0].data().orderNumber;
         const lastOrderNumber = parseInt(lastOrder.split('/')[1]);
         orderNumber.value = `${currentYear}/${String(lastOrderNumber + 1).padStart(3, '0')}`;
       } else {
         orderNumber.value = `${currentYear}/001`;
       }
     };
 
     const handleFileUpload = (event, index) => {
       form.files[index].file = event.target.files[0];
     };
 
     const addFile = () => {
       form.files.push({ file: null });
       nextTick(() => {
         const newFileInput = document.querySelectorAll('.file-item input[type="file"]')[form.files.length - 1];
         if (newFileInput) newFileInput.focus();
       });
     };
 
     const removeFile = (index) => {
       form.files.splice(index, 1);
     };
 
     const addUser = () => {
       if (selectedUser.value.length) {
         selectedUser.value.forEach(user => {
           form.assignedUsers.push(user);
           users.value = users.value.filter(u => u.id !== user.id);
         });
         selectedUser.value = [];
       }
     };
 
     const removeUser = (index) => {
       const user = form.assignedUsers.splice(index, 1)[0];
       users.value.push(user);
     };
 
     const addMainTask = (index = null) => {
       form.mainTasks.push({ task: '', subTasks: [''] });
       nextTick(() => {
         if (index !== null) {
           const newTaskTextarea = document.querySelectorAll('.task-item textarea')[index + 1];
           if (newTaskTextarea) newTaskTextarea.focus();
         }
       });
     };
 
     const removeMainTask = (index) => {
       form.mainTasks.splice(index, 1);
     };
 
     const addSubTask = (taskIndex, index = null) => {
       form.mainTasks[taskIndex].subTasks.push('');
       nextTick(() => {
         const subTaskInputs = document.querySelectorAll(`.task-item:nth-child(${taskIndex + 2}) .subtask-item input`);
         if (subTaskInputs.length > 0) {
           subTaskInputs[subTaskInputs.length - 1].focus();
         }
       });
     };
 
     const removeSubTask = (taskIndex, subTaskIndex) => {
       form.mainTasks[taskIndex].subTasks.splice(subTaskIndex, 1);
     };
 
     const addMaterial = () => {
       form.materials.push('');
       nextTick(() => {
         const newMaterialInput = document.querySelectorAll('.material-item textarea')[form.materials.length - 1];
         if (newMaterialInput) newMaterialInput.focus();
       });
     };
 
     const removeMaterial = (index) => {
       form.materials.splice(index, 1);
     };
 
     const addTool = () => {
       form.tools.push('');
       nextTick(() => {
         const newToolInput = document.querySelectorAll('.tool-item textarea')[form.tools.length - 1];
         if (newToolInput) newToolInput.focus();
       });
     };
 
     const removeTool = (index) => {
       form.tools.splice(index, 1);
     };
 
     const addOrder = async () => {
       isSubmitting.value = true;
       try {
         const cleanForm = (obj) => {
           const newObj = {};
           for (const key in obj) {
             if (Array.isArray(obj[key])) {
               newObj[key] = obj[key].map(item => item || '');
             } else {
               newObj[key] = obj[key] || '';
             }
           }
           return newObj;
         };
 
         const newOrder = cleanForm({
           orderNumber: orderNumber.value,
           orderName: form.orderName,
           clientData: form.clientData,
           assignedUsers: form.assignedUsers.map(user => user.id),
           startDate: form.startDate,
           endDate: form.endDate,
           address: form.address,
           pinCoords: pinCoords.lat && pinCoords.lng ? `${pinCoords.lat}, ${pinCoords.lng}` : '',
           mainTasks: form.mainTasks.map(task => cleanForm({
             task: task.task,
             subTasks: task.subTasks
           })),
           materials: form.materials,
           tools: form.tools,
           created_at: new Date(),
           updated_at: new Date()
         });
 
         const docRef = await addDoc(collection(db, 'orders'), newOrder);
 
         for (const fileItem of form.files) {
           if (fileItem.file) {
             const storageReference = storageRef(storage, `orders/${docRef.id}/${fileItem.file.name}`);
             await uploadBytes(storageReference, fileItem.file);
           }
         }
 
         if (toastRef.value) {
           toastRef.value.add({ severity: 'success', summary: 'Sukces', detail: 'Zlecenie dodane pomyślnie.', life: 3000 });
         }
 
         Object.keys(form).forEach(key => form[key] = Array.isArray(form[key]) ? [] : '');
         form.mainTasks = [{ task: '', subTasks: [''] }];
         form.materials = [''];
         form.tools = [''];
         form.files = [{ file: null }];
         await generateOrderNumber();
         pinAddress.value = '';
         pinCoords.lat = null;
         pinCoords.lng = null;
       } catch (error) {
         console.error('Error adding order:', error);
         if (toastRef.value) {
           toastRef.value.add({ severity: 'error', summary: 'Błąd', detail: 'Błąd podczas dodawania zlecenia.', life: 3000 });
         }
       } finally {
         isSubmitting.value = false;
       }
     };
 
     const expandText = (event) => {
       const textarea = event.target;
       const start = textarea.selectionStart;
       const end = textarea.selectionEnd;
       textarea.value = textarea.value.substring(0, start) + '\n' + textarea.value.substring(end);
       textarea.rows += 1;
       textarea.selectionStart = textarea.selectionEnd = start + 1;
       event.preventDefault();
     };
 
     const increaseInputRows = (taskIndex, subTaskIndex) => {
       form.mainTasks[taskIndex].subTasks[subTaskIndex] += '\n';
     };
 
     const loadGoogleMaps = () => {
       if (!apiKey.value) {
         console.error('API key is missing or undefined.');
         return;
       }
       const script = document.createElement('script');
       script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey.value}&callback=initMap&libraries=places&v=weekly`;
       script.async = true;
       script.defer = true;
       document.head.appendChild(script);
     };
 
     const initMap = () => {
       const mapOptions = {
         center: { lat: 53.623, lng: 17.899 },
         zoom: 6
       };
       map.value = new google.maps.Map(document.getElementById('map'), mapOptions);
 
       map.value.addListener('click', (event) => {
         if (addingPin.value) {
           if (marker.value) {
             marker.value.setMap(null);
           }
           marker.value = new google.maps.Marker({
             position: event.latLng,
             map: map.value
           });
           const geocoder = new google.maps.Geocoder();
           geocoder.geocode({ location: event.latLng }, (results, status) => {
             if (status === 'OK' && results[0]) {
               pinAddress.value = results[0].formatted_address;
               pinCoords.lat = event.latLng.lat();
               pinCoords.lng = event.latLng.lng();
             } else {
               console.error('Geocode was not successful for the following reason: ' + status);
             }
           });
           addingPin.value = false;
         }
       });
 
       onMounted(() => {
         watch(() => form.address, (newAddress) => {
           if (newAddress) {
             updateMap(newAddress, map.value);
           }
         });
       });
 
       const addressInput = document.getElementById('address');
       const autocomplete = new google.maps.places.Autocomplete(addressInput);
       autocomplete.bindTo('bounds', map.value);
 
       autocomplete.addListener('place_changed', () => {
         const place = autocomplete.getPlace();
         if (!place.geometry) {
           console.error("No details available for input: '" + place.name + "'");
           return;
         }
 
         form.address = place.formatted_address;
         updateMap(place.formatted_address, map.value);
       });
     };
 
     const updateMap = (address, map) => {
       const geocoder = new google.maps.Geocoder();
       geocoder.geocode({ address }, (results, status) => {
         if (status === 'OK' && results[0]) {
           const newMarker = new google.maps.Marker({
             map,
             position: results[0].geometry.location
           });
           map.setCenter(results[0].geometry.location);
 
           google.maps.event.addListener(newMarker, 'click', () => {
             window.open(`https://www.google.com/maps/search/?api=1&query=${results[0].geometry.location.lat()},${results[0].geometry.location.lng()}`, '_blank');
           });
         } else {
           console.error('Geocode was not successful for the following reason: ' + status);
         }
       });
     };
 
     const searchAddress = () => {
       const address = form.address;
       const mapInstance = new google.maps.Map(document.getElementById('map'), {
         center: { lat: 53.623, lng: 17.899 },
         zoom: 6
       });
       updateMap(address, mapInstance);
     };
 
     const enableAddPin = () => {
       addingPin.value = true;
     };
 
     const removePin = () => {
       console.log('Próba usunięcia pineski...');
       if (marker.value) {
         console.log('Znaleziono marker:', marker.value);
         marker.value.setMap(null); // Usuń marker z mapy
         marker.value = null; // Wyczyść referencję do markera
         pinAddress.value = ''; // Wyczyść adres pineski
         pinCoords.lat = null; // Zresetuj szerokość geograficzną
         pinCoords.lng = null; // Zresetuj długość geograficzną
         console.log('Pineska została pomyślnie usunięta.');
       } else {
         console.log('Brak markera do usunięcia.');
       }
     };
 
     const fetchUserThemePreference = async () => {
       try {
         const themeDoc = await getDoc(themeDocRef);
         if (themeDoc.exists()) {
           isDarkMode.value = themeDoc.data().darkMode;
           document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
         } else {
           await setDoc(themeDocRef, { darkMode: isDarkMode.value });
         }
       } catch (error) {
         console.error('Error fetching user theme preference:', error);
       }
     };
 
     const toggleTheme = async () => {
       isDarkMode.value = !isDarkMode.value;
       document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light');
       try {
         await updateDoc(themeDocRef, { darkMode: isDarkMode.value });
       } catch (error) {
         console.error('Error updating theme:', error);
       }
     };
 
     onMounted(async () => {
       await generateOrderNumber();
       await fetchUsers();
       await fetchUserThemePreference();
       loadGoogleMaps();
       window.initMap = initMap;
     });
 
     return {
       form,
       orderNumber,
       isSubmitting,
       users,
       selectedUser,
       isBoss,
       addOrder,
       handleFileUpload,
       addFile,
       removeFile,
       addUser,
       removeUser,
       addMainTask,
       removeMainTask,
       addSubTask,
       removeSubTask,
       addMaterial,
       removeMaterial,
       addTool,
       removeTool,
       searchAddress,
       toggleTheme,
       expandText,
       increaseInputRows,
       isDarkMode,
       toastRef,
       enableAddPin,
       removePin,
       pinAddress,
       pinCoords
     };
   }
 };
 </script>
 
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Roboto:wght@400;700&display=swap');
  
  body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
  }
  
  .dark {
    --background-color: #333;
    --text-color: #fff;
    --border-color: #ccc;
    --field-background: #222;
    --input-background: #555;
  }
  
  .light {
    --background-color: #f0f0f0;
    --text-color: #333;
    --border-color: #333;
    --field-background: #fff;
    --input-background: #ddd;
  }
  
  body.dark {
    background-color: var(--background-color);
    color: var(--text-color);
  }
  
  body.light {
    background-color: var(--background-color);
    color: var(--text-color);
  }
  
  .theme-toggle-btn {
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: var(--secondary-color);
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
    z-index: 1000;
  }
  
  .theme-toggle-btn:hover {
    background-color: var(--primary-color);
    transform: scale(1.05);
  }
  
  .add-order {
    width: 1200px;
    margin: 0 auto;
    padding: 30px;
    background: var(--background-color);
    border-radius: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  
  .add-order h1 {
    font-family: 'Montserrat', sans-serif;
    font-size: 26px;
    margin-bottom: 20px;
    color: var(--primary-color);
    text-align: center;
  }
  
  .p-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    background-color: var(--field-background);
    width: 100%;
  }
  
  .p-field label {
    color: var(--text-color);
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .input-container {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  
  .input-container InputText,
  .input-container input,
  .input-container Textarea,
  .input-container MultiSelect {
    flex: 1;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    background-color: var(--input-background);
    color: var(--text-color);
    width: 100%;
  }
  
  .input-container Button {
    flex-shrink: 0;
    margin-right: 5px;
    background-color: var(--secondary-color);
    border: none;
    padding: 10px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
  }
  
  .input-container Button:hover {
    background-color: var(--primary-color);
    transform: scale(1.05);
  }
  
  .user-item,
  .task-item,
  .material-item,
  .tool-item,
  .file-item,
  .subtask-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    background-color: var(--field-background);
    width: 100%;
  }
  
  .user-item span,
  .task-item Textarea,
  .material-item Textarea,
  .tool-item Textarea,
  .subtask-item Textarea {
    flex: 1;
    margin-right: 10px;
    width: 100%;
  }
  
  .user-item Button,
  .task-item Button,
  .material-item Button,
  .tool-item Button,
  subtask-item Button,
  .file-item Button {
    flex-shrink: 0;
    margin-right: 5px;
    background-color: var(--secondary-color);
    border: none;
    padding: 10px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
  }
  
  .user-item Button:hover,
  .task-item Button:hover,
  .material-item Button:hover,
  .tool-item Button:hover,
  subtask-item Button:hover,
  .file-item Button:hover {
    background-color: var(--primary-color);
    transform: scale(1.05);
  }
  
  .task-item Textarea,
  .material-item Textarea,
  .tool-item Textarea,
  subtask-item Textarea {
    resize: none;
    width: 100%;
  }
  
  .task-item.full-width Textarea,
  .p-field.full-width {
    width: 100%;
  }
  
  .p-field input[type="datetime-local"] {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    background-color: var(--input-background);
    color: var(--text-color);
    margin-top: 5px;
  }
  
  Button {
    background-color: var(--secondary-color);
    border: 1px double var(--border-color);
    padding: 10px;
    border-radius: 20px;
    color: var(--text-color);
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
  }
  
  Button:hover {
    background-color: var(--primary-color);
    transform: scale(1.05);
  }
  
  Button[disabled] {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .file-item input[type="file"] {
    flex: 1;
    background-color: var(--secondary-color);
    color: white;
    border: none;
    padding: 5px;
    border-radius: 20px;
    width: 100%;
  }
  
  .file-item input[type="file"]::-webkit-file-upload-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 20px;
    cursor: pointer;
  }
  
  #map {
    width: 100%;
    height: 400px;
    margin-top: 20px;
    border-radius: 20px;
  }
  
  .map-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  .add-order form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .add-order form Button {
    align-self: center;
    margin-top: 20px;
  }
  
  .toast-success {
    background-color: var(--success-color);
  }
  
  .toast-error {
    background-color: var(--error-color);
  }
  
  .p-field input:valid {
    border-color: var(--success-color);
  }
  
  .p-field input:invalid {
    border-color: var(--error-color);
  }
  
  .pin-details {
    margin-top: 10px;
    background-color: var(--field-background);
    padding: 10px;
    border-radius: 10px;
    color: var(--text-color);
  }
  
  @media (max-width: 768px) {
    .add-order {
      padding: 20px;
    }
  
    .input-container {
      flex-direction: column;
      width: 100%;
    }
  
    .input-container Button {
      margin: 10px 0;
    }
  }
  </style>
  