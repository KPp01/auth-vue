// src/components/modulesAI/ExportManager.js
import { saveAs } from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';

export function exportData(data, format, filename) {
  switch (format) {
    case 'json':
      exportToJSON(data, filename);
      break;
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'pdf':
      exportToPDF(data, filename);
      break;
    default:
      console.error(`Unsupported format: ${format}`);
  }
}

function exportToJSON(data, filename = 'export.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  saveAs(blob, filename);
}

function exportToCSV(data, filename = 'export.csv') {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

function exportToPDF(data, filename = 'export.pdf') {
  const docDefinition = {
    content: [
      { text: 'Data Export', style: 'header' },
      { text: JSON.stringify(data, null, 2), style: 'content' },
    ],
  };
  pdfMake.createPdf(docDefinition).download(filename);
}

function convertToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const index in array[i]) {
      if (line !== '') line += ',';
      line += array[i][index];
    }
    str += line + '\r\n';
  }
  return str;
}
