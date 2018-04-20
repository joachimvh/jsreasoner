
let T = require('./terms/Terms');
let ForwardReasoner = require('./reasoning/ForwardReasoner');
let BackwardReasoner = require('./reasoning/BackwardReasoner');
let N3Parser = require('./parsing/N3Parser');
let BackParser = require('./parsing/TermParser');
let fs = require('fs');

// let terms = parser.toTerms(':a :k :o. :a :b :c. {?x :b :c}=>{ :p :q [:r :s]. }. { ?y :r :s} => { :we :got :blanks. }.');
// let terms = parser.toTerms(':a :k :o. :a :b :c. {?x :b :c}=>{{?x :k ?y}=>{:p :p ?y}}.');
let terms = N3Parser.toTerms(':a :k :o. :a :b :c. {?x :b :c}=>{?x :q :x}. {:a :q ?z. :a :k ?y}=>{:p :p ?y}.');
let goals = N3Parser.toTerms(':p :p :o.');
console.log('FORWARD REASONING');
console.log(ForwardReasoner.reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
console.log('BACKWARD REASONING');
console.log(BackwardReasoner.reason(goals, terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));

// let terms = N3Parser.toTerms('{?everyone :says {_:x a :Unicorn}}=>{ :z :z :z }.');
// let result = [].concat(...terms.map(t => t.toSNF()));
// console.log(result.join('\n'));
// result = BackParser.fromSNF(result);
// console.log(result.join('\n'));

// let data = fs.readFileSync('rules.n3', 'utf8');
// let terms = N3Parser.toTerms(data);
// console.log(new ForwardReasoner().reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));