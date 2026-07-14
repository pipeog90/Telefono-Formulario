const filterKey = "B";
const r1 = new RegExp('^' + filterKey + '(\\d| -|$)');
console.log(r1);
console.log(r1.test('B5 - Crisis'));
console.log(r1.test('B10 - Conducta'));
console.log(r1.test('B - Problemas'));
console.log(r1.test('B'));
console.log(r1.test('Buen Samaritano'));
