
let T = require('./terms/Terms');
let ForwardReasoner = require('./reasoning/ForwardReasoner');
let BackwardReasoner = require('./reasoning/BackwardReasoner');
let Parser = require('./parsing/N3Parser');
let fs = require('fs');

let parser = new Parser();
let terms = parser.toTerms('{ ?x :b :c. :a :b :c. } => { ?x ?x ?x }. :a :b :c. :d :b :c.').toSNF().list;
let goals = parser.toTerms(':d :d :d.').toSNF().list;
console.log('FORWARD REASONING');
console.log(new ForwardReasoner().reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
console.log('BACKWARD REASONING');
console.log(new BackwardReasoner().reason(goals, terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));

// let parser = new Parser();
// let terms = parser.toTerms('{:a :d { ?x :b :c. :a :b :c. }} => {:a :d {?y ?y ?y} }.');
// console.log(terms + '');