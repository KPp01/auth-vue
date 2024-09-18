// fileGetter.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definiowanie __dirname w modułach ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funkcja generująca nazwę pliku na podstawie aktualnej daty i godziny
function generateOutputFileName(subfolderName) {
    const now = new Date();
    const dateString = now.toISOString()
        .replace(/:/g, '-')   // Zamiana dwukropków na myślniki
        .replace('T', '_')    // Zamiana litery T na podkreślnik
        .split('.')[0];       // Usunięcie części milisekund i strefy czasowej
    return `Code_${subfolderName}_${dateString}.txt`;
}

// Funkcja tworząca folder, jeśli nie istnieje
function createOutputFolder(folderName) {
    const outputFolderPath = path.join(__dirname, folderName);
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath, { recursive: true });
        console.log(`Utworzono folder: ${outputFolderPath}`);
    }
    return outputFolderPath;
}

// Funkcja sprawdzająca, czy katalog powinien być uwzględniony
function shouldIncludeDir(baseDir, dirPath) {
    const relativePath = path.relative(baseDir, dirPath);

    const excludeDirPatterns = [
        'node_modules',
        '.git',
        'dist',
        'exported_code',
        'functions/node_modules',
        '.firebase',
        // Dodaj tutaj inne katalogi do wykluczenia
    ];

    // Wyklucz katalogi na podstawie wzorców
    for (const pattern of excludeDirPatterns) {
        if (relativePath === pattern || relativePath.startsWith(pattern + path.sep)) {
            return false;
        }
    }

    // Wyklucz ukryte katalogi
    const dirName = path.basename(dirPath);
    if (dirName.startsWith('.')) {
        return false;
    }

    return true;
}

// Funkcja sprawdzająca, czy plik powinien być uwzględniony
function shouldIncludeFile(baseDir, filePath) {
    const relativePath = path.relative(baseDir, filePath);

    const excludeFilePatterns = [
        'package-lock.json',
        'yarn.lock',
        'firebase.json',
        '.firebaserc',
        'bfg-*.jar',
        'input.txt',
        'Code_*.txt',
        'serviceAccount.json',
        'serviceAccountKey.json',
        'config.js',
        'config.json',
        // Dodaj tutaj inne pliki do wykluczenia
    ];

    // Wyklucz pliki na podstawie wzorców
    for (const pattern of excludeFilePatterns) {
        if (relativePath === pattern || relativePath.startsWith(pattern + path.sep)) {
            return false;
        }
    }

    // Wyklucz ukryte pliki
    const fileName = path.basename(filePath);
    if (fileName.startsWith('.')) {
        return false;
    }

    const includeExtensions = ['.js', '.vue', '.css', '.html', '.json', '.svg'];
    const ext = path.extname(filePath);
    if (!includeExtensions.includes(ext)) {
        return false;
    }

    return true;
}

// Funkcja do rekursywnego zbierania plików z folderu
function collectFilesBySubfolder(baseDir) {
    const filesBySubfolder = {};

    function traverse(dirPath) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.isDirectory()) {
                if (!shouldIncludeDir(baseDir, fullPath)) {
                    continue;
                }
                traverse(fullPath);
            } else if (entry.isFile()) {
                if (!shouldIncludeFile(baseDir, fullPath)) {
                    continue;
                }

                let subfolderPath = path.dirname(relativePath);
                let subfolderName = subfolderPath === '.' || subfolderPath === '' ? 'root' : subfolderPath.replace(/[\\\/]/g, '_');

                // Logowanie ścieżek i nazw podfolderów
                console.log(`Przetwarzanie pliku: ${relativePath}, Podfolder: ${subfolderName}`);

                if (!filesBySubfolder[subfolderName]) {
                    filesBySubfolder[subfolderName] = [];
                }
                filesBySubfolder[subfolderName].push(fullPath);
            }
        }
    }

    traverse(baseDir);
    return filesBySubfolder;
}

function saveFiles(filesBySubfolder, outputFolderPath) {
    // Logowanie zawartości filesBySubfolder
    console.log('Znalezione podfoldery:', Object.keys(filesBySubfolder));

    for (const subfolder in filesBySubfolder) {
        const filesContent = {};
        const fileList = filesBySubfolder[subfolder];

        fileList.forEach((filePath) => {
            if (fs.existsSync(filePath)) {
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const relativePath = path.relative(__dirname, filePath);
                    filesContent[relativePath] = content;
                } catch (err) {
                    console.error(`Błąd podczas czytania pliku ${filePath}: ${err}`);
                }
            } else {
                console.error(`Plik ${filePath} nie został znaleziony.`);
            }
        });

        const allContent = Object.entries(filesContent)
            .map(([filePath, content]) => `--- Zawartość pliku: ${filePath} ---\n${content}\n`)
            .join('\n');

        const outputFileName = generateOutputFileName(subfolder);
        const outputFilePath = path.join(outputFolderPath, outputFileName);

        fs.writeFileSync(outputFilePath, allContent, 'utf-8');
        console.log(`Zapisano plik: '${outputFilePath}'`);
    }
}

function main() {
    const args = process.argv.slice(2);
    let folderName = 'exported_code'; // Domyślna nazwa folderu

    if (args.length >= 1) {
        folderName = args[0];
    }

    const outputFolderPath = createOutputFolder(folderName);

    const srcDir = path.join(__dirname, 'src'); // Ścieżka do folderu src
    console.log(`Rozpoczynam przetwarzanie folderu: ${srcDir}`);
    const filesBySubfolder = collectFilesBySubfolder(srcDir);
    saveFiles(filesBySubfolder, outputFolderPath);
}

main();
