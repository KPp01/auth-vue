import fs from 'fs';
import archiver from 'archiver';
import path from 'path';

// Nazwa pliku wyjściowego
const OUTPUT_FILE = 'code_export.zip';

// Lista wykluczonych plików i folderów
const excludeList = [
  '.git',
  'node_modules',
  '.env',
  '*.log',
  'package-lock.json',
  'yarn.lock',
  'dist',
  'build',
  '*.zip',
  '*.tar.gz',
  '*.key',
  '*.pem',
  'secrets',
  'config.js',
  'config.json',
  'serviceAccount.json',
  'serviceAccountKey.json',
  '.firebase',
  'firebase.json',
  '.firebaserc',
  'functions/node_modules',
  'functions/package-lock.json',
  'functions/.env',
  'functions/serviceAccount.json',
  'functions/serviceAccountKey.json'
];

const output = fs.createWriteStream(OUTPUT_FILE);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log(`Archiwum utworzone. Rozmiar: ${archive.pointer()} bajtów.`);
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Funkcja do dodawania plików do archiwum z uwzględnieniem wykluczeń
function addFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(process.cwd(), fullPath);

    if (shouldInclude(relativePath)) {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        addFiles(fullPath);
      } else if (stats.isFile()) {
        archive.file(fullPath, { name: relativePath });
      }
    }
  });
}

// Funkcja sprawdzająca, czy plik powinien być uwzględniony
function shouldInclude(filePath) {
  return !excludeList.some(excludeItem => {
    return filePath === excludeItem || filePath.startsWith(`${excludeItem}/`);
  });
}

// Rozpoczęcie procesu dodawania plików
addFiles(process.cwd());

// Finalizacja archiwum
archive.finalize();
