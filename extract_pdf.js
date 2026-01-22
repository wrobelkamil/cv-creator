import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = './przyklad/Kamil Wróbel CV GRAFIK 3D.pdf';

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(err => {
    console.error("Error parsing PDF:", err);
});
