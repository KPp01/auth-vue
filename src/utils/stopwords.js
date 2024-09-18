// Lista stop words dla języka angielskiego
const englishStopwords = [
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 
    'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 
    'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 
    'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'me', 'more', 
    'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 
    'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 
    'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 
    'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 
    'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 
    'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
  ];
  
  // Lista stop words dla języka polskiego
  const polishStopwords = [
    'a', 'aby', 'ach', 'ale', 'bardzo', 'bez', 'bo', 'by', 'być', 'ci', 'cię', 'ciebie', 'co', 
    'czy', 'dla', 'do', 'dużo', 'dwa', 'dwaj', 'dwie', 'dwoje', 'dziś', 'dzisiaj', 'gdy', 'gdyby', 
    'gdyż', 'go', 'ich', 'i', 'ile', 'im', 'inny', 'ja', 'ją', 'jak', 'jakby', 'jaki', 'je', 'jeden', 
    'jedna', 'jedno', 'jego', 'jej', 'jemu', 'jeśli', 'jest', 'jestem', 'jeżeli', 'już', 'każdy', 
    'kiedy', 'kto', 'który', 'ma', 'mnie', 'moi', 'mój', 'moja', 'moje', 'my', 'na', 'nam', 'nas', 
    'nasi', 'nasz', 'nasza', 'nasze', 'nie', 'nią', 'nic', 'niech', 'niego', 'niej', 'niemu', 'nigdy', 
    'nim', 'nimi', 'ono', 'oraz', 'owszem', 'pan', 'po', 'pod', 'ponieważ', 'przez', 'przy', 'przed', 
    'się', 'tak', 'także', 'tam', 'te', 'tego', 'tej', 'ten', 'to', 'tobie', 'tu', 'twoi', 'twój', 
    'twoja', 'twoje', 'ty', 'w', 'we', 'więc', 'wszyscy', 'wszystkie', 'za', 'że'
  ];
  
  // Eksportowanie list stop words
  export const stopwords = {
    english: englishStopwords,
    polish: polishStopwords
  };
  