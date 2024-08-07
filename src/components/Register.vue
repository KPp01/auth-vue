<template>
  <div class="register">
    <h2>Rejestracja</h2>
    <form @submit.prevent="onSubmit" class="register-form" id="demo-form">
      <div class="p-field">
        <label for="firstName">Imię</label>
        <InputText id="firstName" v-model="form.firstName" placeholder="Wprowadź imię" required :class="{'p-invalid': v$.firstName.$error}" />
        <small v-if="v$.firstName.$error" class="p-error">Imię jest wymagane.</small>
      </div>
      <div class="p-field">
        <label for="lastName">Nazwisko</label>
        <InputText id="lastName" v-model="form.lastName" placeholder="Wprowadź nazwisko" required :class="{'p-invalid': v$.lastName.$error}" />
        <small v-if="v$.lastName.$error" class="p-error">Nazwisko jest wymagane.</small>
      </div>
      <div class="p-field">
        <label for="email">Email</label>
        <InputText id="email" v-model="form.email" placeholder="Wprowadź email" required :class="{'p-invalid': v$.email.$error}" />
        <small v-if="v$.email.$error" class="p-error">Email jest wymagany i musi być poprawny.</small>
      </div>
      <div class="p-field">
        <label for="phoneNumber">Numer Telefonu</label>
        <InputText id="phoneNumber" v-model="form.phoneNumber" placeholder="Wprowadź numer telefonu" required :class="{'p-invalid': v$.phoneNumber.$error}" />
        <small v-if="v$.phoneNumber.$error" class="p-error">Numer telefonu jest wymagany.</small>
      </div>
      <div class="p-field">
        <div class="password-container">
          <label for="password">Hasło</label>
          <Password inputId="password" v-model="form.password" placeholder="Wprowadź hasło" toggleMask feedback="true" required :class="{'p-invalid': v$.password.$error}" />
          <small v-if="v$.password.$error" class="p-error">Hasło jest wymagane.</small>
        </div>
      </div>
      <div class="p-field">
        <div class="password-container">
          <label for="confirmPassword">Potwierdź Hasło</label>
          <Password inputId="confirmPassword" v-model="form.confirmPassword" placeholder="Potwierdź hasło" toggleMask feedback="true" required :class="{'p-invalid': v$.confirmPassword.$error}" />
          <small v-if="v$.confirmPassword.$error" class="p-error">Potwierdzenie hasła jest wymagane i musi się zgadzać z hasłem.</small>
        </div>
      </div>
      <Button label="Zarejestruj" class="g-recaptcha" :data-sitekey="reCaptchaKey" data-callback='onSubmit' data-action='submit' :disabled="isSubmitting"></Button>
    </form>
    <Button @click="registerWithGoogle" class="google-button" label="Zarejestruj przez Google" :disabled="isSubmitting"></Button>
    <Toast ref="toast" />
  </div>
</template>

<script>
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { getToken } from 'firebase/app-check';
import { auth, db, appCheck } from '@/main';
import axios from 'axios';
import { required, email, minLength } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import { reactive, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';

import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

export default defineComponent({
  components: {
    InputText,
    Password,
    Button,
    Toast
  },
  setup() {
    const store = useStore();
    const form = reactive({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    });

    const validateConfirmPassword = value => value === form.password || 'Hasła muszą się zgadzać';

    const rules = {
      firstName: { required },
      lastName: { required },
      email: { required, email },
      phoneNumber: { required },
      password: { required, minLength: minLength(8) },
      confirmPassword: { required, validateConfirmPassword }
    };

    const v$ = useVuelidate(rules, form);
    const reCaptchaKey = ref(import.meta.env.VITE_RECAPTCHA_SITE_KEY);
    const isSubmitting = ref(false);

    return { form, v$, reCaptchaKey, isSubmitting, store };
  },
  methods: {
    async register(token) {
      this.v$.$touch();
      if (this.v$.$invalid) {
        console.log('Form validation failed');
        return;
      }

      this.isSubmitting = true;
      console.log('Form validation succeeded, starting registration process');

      try {
        const appCheckToken = await getToken(appCheck, true);
        const verificationResponse = await axios.post('https://verifyrecaptcha-5gixu7cqaq-uc.a.run.app', { token }, {
          headers: {
            'Content-Type': 'application/json',
            'X-Firebase-AppCheck': appCheckToken.token
          }
        });

        if (!verificationResponse.data.success) {
          this.$refs.toast.add({ severity: 'error', summary: 'Błąd', detail: 'Nieprawidłowa reCAPTCHA', life: 3000 });
          this.isSubmitting = false;
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, this.form.email, this.form.password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: `${this.form.firstName} ${this.form.lastName}`
        });

        const userData = {
          id: user.uid,
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          email: this.form.email,
          phoneNumber: this.form.phoneNumber,
          permissions: 'user',
          created_at: new Date(),
          updated_at: new Date(),
          is_active: true,
          profile_picture_url: '',
          last_login: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        this.$refs.toast.add({ severity: 'success', summary: 'Sukces', detail: 'Użytkownik został dodany do Firestore.', life: 3000 });

        this.store.commit('setUser', userData);
        await this.$nextTick();
        this.$router.push('/dashboard').then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Error during registration process:', error);

        if (error.code === 'auth/email-already-in-use') {
          this.$refs.toast.add({ severity: 'error', summary: 'Błąd', detail: 'Ten email jest już w użyciu. Proszę użyć innego adresu email.', life: 3000 });
        } else {
          this.$refs.toast.add({ severity: 'error', summary: 'Błąd', detail: 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.', life: 3000 });
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    async registerWithGoogle() {
      this.isSubmitting = true;

      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userData = {
          id: user.uid,
          firstName: user.displayName ? user.displayName.split(' ')[0] : '',
          lastName: user.displayName ? user.displayName.split(' ')[1] : '',
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          permissions: 'user',
          created_at: new Date(),
          updated_at: new Date(),
          is_active: true,
          profile_picture_url: user.photoURL || '',
          last_login: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        this.store.commit('setUser', userData);
        await this.$nextTick();
        this.$router.push('/dashboard').then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Błąd podczas rejestracji przez Google:', error);
        this.$refs.toast.add({ severity: 'error', summary: 'Błąd', detail: 'Nie udało się zalogować przez Google.', life: 3000 });
      } finally {
        this.isSubmitting = false;
      }
    },
    onSubmit() {
      grecaptcha.ready(() => {
        grecaptcha.execute(this.reCaptchaKey, { action: 'submit' }).then((token) => {
          this.register(token);
        });
      });
    }
  },
  mounted() {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${this.reCaptchaKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.onSubmit = this.onSubmit;
  }
});
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background: #333; /* Ciemne tło */
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Zwiększony cień */
}

h2 {
  text-align: center;
  color: #1E90FF; /* Niebieski */
  margin-bottom: 20px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.p-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

label {
  color: #FFF; /* Biały tekst */
}

.p-invalid {
  border: 1px solid red;
}

.p-error {
  color: #ff5722; /* Pomarańczowy */
}

.password-container {
  position: relative;
}

.password-container .p-password {
  width: 100%;
}

.google-button {
  background-color: #FF5722;
  color: white;
  margin-top: 15px;
  padding: 10px;
}

.google-button:hover {
  background-color: #E64A19;
}

button, input, .p-password {
  background-color: #444;
  border: none;
  padding: 10px;
  border-radius: 5px;
  color: white;
}

button:hover {
  background-color: #1E90FF;
}

input::placeholder {
  color: #888;
}
</style>
