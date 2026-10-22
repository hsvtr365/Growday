const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const source = readFileSync(join(__dirname, '..', 'app.js'), 'utf8');
const context = vm.createContext({assert, console, localStorage:{ getItem:()=>null }});
// Exercise the actual data functions before browser event registration.
vm.runInContext(source.split("const modal=document.getElementById('modal');")[0] + `
assert.equal(shift('2026-12-31',1),'2027-01-01');
assert.equal(shift('2028-03-01',-1),'2028-02-29');
state={habits:[{id:'a',name:'운동',created:'2026-01-01',days:[1],target:30,type:'time',unit:'분',scheduleHistory:[{until:'2026-10-22',days:[4],target:20,type:'time',unit:'분'}]}],records:{'a:2026-10-22':{done:true,value:20}}};
today='2026-10-22';
assert.equal(habitsFor('2026-10-22').length,1,'past Thursday schedule must survive editing');
assert.equal(habitsFor('2026-10-22')[0].target,20);
assert.equal(habitsFor('2026-10-26')[0].target,30);
assert.equal(summary('2026-10-22').rate,100);
assert.equal(summary('2026-10-23').total,0,'rest days must have no planned habits');
assert.equal(metrics('2026-10-22','2026-10-23').rate,100,'rest days must not reduce completion');
state.records['a:2026-10-26']={done:true};
assert.equal(level('2026-10-26'),0,'future days must never render as completed');
state.habits[0].archivedOn='2026-10-23';
assert.equal(habitsFor('2026-10-22').length,1,'archiving must retain past statistics');
assert.equal(habitsFor('2026-10-26').length,0);
assert.equal(esc('<script>'), '&lt;script&gt;');
console.log('Passed: date rollover, leap year, schedule history, rest days, future dates, archive history, escaping.');
`,context);
