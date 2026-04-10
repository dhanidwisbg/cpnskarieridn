const { PDFParse } = require('pdf-parse');
const parser = new PDFParse();
console.log("PDFParse instance keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
