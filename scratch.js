const { StaveNote } = require('vexflow');
const note = new StaveNote({ keys: ['c/4'], duration: 'hd' });
console.log(note.isDotted());
