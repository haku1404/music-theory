const { StaveNote, BarNote, Formatter } = require('vexflow');
const notes = [
  new StaveNote({ keys: ['c/4'], duration: 'q' }),
  new BarNote(),
  new StaveNote({ keys: ['d/4'], duration: 'q' })
];
console.log(notes.length);
