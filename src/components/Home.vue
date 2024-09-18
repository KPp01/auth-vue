<template>
  <div class="home">
    <h1>Strona Główna</h1>
    <p>Witamy na stronie głównej naszej aplikacji do zarządzania zleceniami. Znajdziesz tu najnowsze informacje i aktualizacje dotyczące naszych usług.</p>
    
    <div class="features">
      <h2>Główne Funkcje</h2>
      <ul>
        <li>Rejestracja i uwierzytelnianie użytkowników</li>
        <li>Bezpieczne logowanie z wykorzystaniem ReCaptcha</li>
        <li>Zarządzanie profilem użytkownika</li>
        <li>Integracja z bazą danych w czasie rzeczywistym</li>
        <li>Dodawanie i zarządzanie zleceniami</li>
      </ul>
    </div>

    <div class="user-guide">
      <h2>Jak Zacząć</h2>
      <p>Aby rozpocząć korzystanie z aplikacji, wykonaj następujące kroki:</p>
      <ol>
        <li>Zarejestruj się, tworząc nowe konto użytkownika.</li>
        <li>Zaloguj się, używając swojego adresu e-mail i hasła.</li>
        <li>Przeczytać i Zaakceptować regulamin</li>
        <li>Uzupełnij swój profil, dodając niezbędne informacje.</li>
        <li>Rozpocznij dodawanie zleceń i zarządzanie nimi poprzez panel użytkownika.</li>
      </ol>
    </div>

    
  </div>
</template>
<script>
export default {
  name: 'Home',
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&family=Roboto:wght@400;700&display=swap');

.home {
  text-align: center;
  padding: 2em;
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

h1 {
  color: #42b983;
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5em;
  margin-bottom: 0.5em;
}

p {
  color: #666;
  font-size: 1.2em;
  margin-bottom: 2em;
}

.features, .user-guide, .contact {
  margin-top: 2em;
  background: white;
  padding: 1.5em;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  font-family: 'Montserrat', sans-serif;
  font-size: 2em;
  margin-bottom: 1em;
}

.features ul, .contact ul {
  list-style-type: none;
  padding: 0;
  font-size: 1.2em;
}

.features li, .contact li {
  background: #e9e9e9;
  margin: 0.5em 0;
  padding: 0.5em;
  border-radius: 5px;
}

.user-guide ol {
  padding-left: 20px;
  text-align: left;
}

.user-guide li {
  background: #e9e9e9;
  margin: 0.5em 0;
  padding: 0.5em;
  border-radius: 5px;
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .home {
    padding: 1em;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  p, .features ul, .contact ul, .user-guide li {
    font-size: 1em;
  }
}
</style>
