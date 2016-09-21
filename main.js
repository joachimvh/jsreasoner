
let T = require('./terms/Terms');
let ForwardReasoner = require('./reasoning/ForwardReasoner');
let BackwardReasoner = require('./reasoning/BackwardReasoner');
let Parser = require('./parsing/N3Parser');
let fs = require('fs');

let parser = new Parser();
let terms = parser.toTerms(':a :k :o. :a :b :c. {?x :b :c}=>{{?x :k ?y}=>{:p :p ?y}}.');
let goals = parser.toTerms(':p :p :o.');
console.log('FORWARD REASONING');
console.log(new ForwardReasoner().reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
// console.log('BACKWARD REASONING');
// console.log(new BackwardReasoner().reason(goals, terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));

// let parser = new Parser();
// let terms = parser.toTerms(':a :k :o. :a :b :c. {?x :b :c}=>{{?x :k ?y}=>{:p :p ?y}}.');
// console.log([].concat(...terms.map(t => t.toSNF())).join('\n'));