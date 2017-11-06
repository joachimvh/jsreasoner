
let T = require('./terms/Terms');
let ForwardReasoner = require('./reasoning/ForwardReasoner');
let BackwardReasoner = require('./reasoning/BackwardReasoner');
let Parser = require('./parsing/N3Parser');
let BackParser = require('./parsing/TermParser');
let fs = require('fs');

// let parser = new Parser();
// let terms = parser.toTerms(':a :k :o. :a :b :c. {?x :b :c}=>{{?x :k ?y}=>{:p :p ?y}}.');
// let goals = parser.toTerms(':p :p :o.');
// console.log('FORWARD REASONING');
// console.log(new ForwardReasoner().reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
// console.log('BACKWARD REASONING');
// console.log(new BackwardReasoner().reason(goals, terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));

// let parser = new Parser();
// let terms = parser.toTerms('{?everyone :says {_:x a :Unicorn}}=>{ :z :z :z }.');
// let result = [].concat(...terms.map(t => t.toSNF()));
// console.log(result.join('\n'));
// result = BackParser.fromSNF(result);
// console.log(result.join('\n'));

let data = fs.readFileSync('rules.n3', 'utf8');
let parser = new Parser();
let terms = parser.toTerms(data);
console.log(new ForwardReasoner().reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));