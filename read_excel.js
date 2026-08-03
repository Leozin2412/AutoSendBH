const XLSX = require('xlsx');
const workbook = XLSX.readFile('MODELO Folha de Ponto Individual de Trabalho - 2025.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log(JSON.stringify(jsonData, null, 2));
