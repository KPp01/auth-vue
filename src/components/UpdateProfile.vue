<template>
  <div class="update-profile">
    <h1>Aktualizacja Profilu</h1>
    
    <!-- Sekcja: Aktualne dane -->
    <div class="current-data-section" v-if="userData">
      <h2>Aktualne dane</h2>
      <p><strong>Imię:</strong> {{ userData.firstName }}</p>
      <p><strong>Nazwisko:</strong> {{ userData.lastName }}</p>
      <p><strong>Numer Telefonu:</strong> {{ userData.phoneNumber }}</p>
      <div v-if="userData.profilePictureUrl">
        <p><strong>Zdjęcie profilowe:</strong></p>
        <img :src="userData.profilePictureUrl" alt="Profile Picture" class="profile-picture"/>
      </div>
    </div>
    
    <!-- Sekcja: Aktualizacja danych -->
    <form @submit.prevent="updateProfile" class="update-profile-form">
      <h2>Aktualizacja danych</h2>
      <div v-if="userData">
        <div class="p-field">
          <label for="firstName">Imię</label>
          <InputText id="firstName" v-model="userData.firstName" placeholder="Wprowadź imię" required />
        </div>
        <div class="p-field">
          <label for="lastName">Nazwisko</label>
          <InputText id="lastName" v-model="userData.lastName" placeholder="Wprowadź nazwisko" required />
        </div>
        <div class="p-field">
          <label for="phoneNumber">Numer Telefonu</label>
          <InputText id="phoneNumber" v-model="userData.phoneNumber" placeholder="Wprowadź numer telefonu" required />
        </div>
        <div class="p-field">
          <label for="profilePicture">Zdjęcie profilowe</label>
          <input type="file" id="profilePicture" @change="onFileChange" />
        </div>
        <Button label="Zaktualizuj" :disabled="isSubmitting" @click="updateProfile"></Button>
      </div>
      <div v-else>
        <p>Ładowanie danych użytkownika...</p>
      </div>
    </form>
    
    <!-- Sekcja: Zmiana hasła -->
    <form @submit.prevent="changePassword" class="change-password-form">
      <h2>Zmiana hasła</h2>
      <div class="p-field">
        <label for="currentPassword">Obecne hasło</label>
        <InputText id="currentPassword" v-model="passwordData.currentPassword" placeholder="Wprowadź obecne hasło" type="password" required />
      </div>
      <div class="p-field">
        <label for="newPassword">Nowe hasło</label>
        <InputText id="newPassword" v-model="passwordData.newPassword" placeholder="Wprowadź nowe hasło" type="password" required />
      </div>
      <div class="p-field">
        <label for="confirmNewPassword">Potwierdź nowe hasło</label>
        <InputText id="confirmNewPassword" v-model="passwordData.confirmNewPassword" placeholder="Potwierdź nowe hasło" type="password" required />
      </div>
      <Button label="Zmień hasło" :disabled="isSubmitting" @click="changePassword"></Button>
    </form>
  </div>
</template>

<script>
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/main';
import { reactive, ref as vueRef, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default {
  name: 'UpdateProfile',
  components: {
    InputText,
    Button
  },
  setup() {
    const userData = reactive({});
    const passwordData = reactive({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    const isSubmitting = vueRef(false);
    const selectedFile = vueRef(null);

    const fetchUserData = async () => {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const userDoc = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDoc);
          if (userSnapshot.exists()) {
            Object.assign(userData, userSnapshot.data());
          } else {
            console.error('No such document!');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const updateProfile = async () => {
      isSubmitting.value = true;
      try {
        const user = getAuth().currentUser;
        if (user) {
          let profilePictureUrl = userData.profilePictureUrl;
          if (selectedFile.value) {
            const storageRef = ref(storage, `profilePictures/${user.uid}`);
            await uploadBytes(storageRef, selectedFile.value);
            profilePictureUrl = await getDownloadURL(storageRef);
          }

          const userDoc = doc(db, 'users', user.uid);
          const updatedData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
          };

          if (profilePictureUrl) {
            updatedData.profilePictureUrl = profilePictureUrl;
          }

          await updateDoc(userDoc, updatedData);
          await fetchUserData();  // Zaktualizuj dane użytkownika bez przeładowania strony
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    const changePassword = async () => {
      isSubmitting.value = true;
      try {
        const user = getAuth().currentUser;
        const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
        await reauthenticateWithCredential(user, credential);

        if (passwordData.newPassword === passwordData.confirmNewPassword) {
          await updatePassword(user, passwordData.newPassword);
          console.log('Password changed successfully');
        } else {
          console.error('Passwords do not match');
        }
      } catch (error) {
        console.error('Error changing password:', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    const onFileChange = (e) => {
      selectedFile.value = e.target.files[0];
    };

    onMounted(() => {
      fetchUserData();
    });

    return { userData, passwordData, isSubmitting, updateProfile, changePassword, onFileChange };
  }
};
</script>

<style scoped>
.update-profile {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  padding: 2em;
}
.update-profile-form, .change-password-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.p-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}
.p-invalid {
  border: 1px solid red;
}
.p-error {
  color: red;
}
.profile-picture {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
}
</style>
