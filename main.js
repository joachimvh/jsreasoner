
let T = require('./terms/Terms');
let ForwardReasoner = require('./reasoning/ForwardReasoner');
let BackwardReasoner = require('./reasoning/BackwardReasoner');
let Parser = require('./parsing/N3Parser');

// let rule = new T.Implication(new T.Formula([new T.Triple(new T.Variable("x"), new T.Constant("b"), new T.Constant("c"))]),
//                              new T.Formula([new T.Triple(new T.Variable("x"), new T.Variable("x"), new T.Variable("x"))]));
// let rule2 = new T.Implication(new T.Formula([new T.Triple(new T.Variable("x"), new T.Constant("b"), new T.Constant("c")),
//                                              new T.Triple(new T.Constant("a"), new T.Constant("b"), new T.Constant("c"))]),
//                               new T.Formula([new T.Triple(new T.Variable("x"), new T.Variable("x"), new T.Variable("x"))]));
// let triple = new T.Triple(new T.Constant("a"), new T.Constant("b"), new T.Constant("c"));
// let triple2 = new T.Triple(new T.Constant("d"), new T.Constant("b"), new T.Constant("c"));
//
// let goal = new T.Triple(new T.Constant("d"), new T.Constant("d"), new T.Constant("d"));

//console.log(rule);

// let m = new Map();
// rule.premise.list[0].solve(m, true, triple);
//console.log(m);

// var gen = Reasoner.step([rule2, triple, triple2]);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);

// console.log('FORWARD REASONING');
// console.log(ForwardReasoner.reason([rule2, triple, triple2]).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
// console.log('BACKWARD REASONING');
// console.log(BackwardReasoner.reason([goal], [rule2, triple, triple2]).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));

let parser = new Parser();
let terms = parser.toTerms('{ ?x :b :c. :a :b :c. } => { ?x ?x ?x }. :a :b :c. :d :b :c.').list;
let goals = parser.toTerms(':d :d :d.').list;
console.log('FORWARD REASONING');
console.log(ForwardReasoner.reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
console.log('BACKWARD REASONING');
console.log(BackwardReasoner.reason(goals, terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));

// let parser = new Parser();
// let terms = parser.toTerms('@forAll :x. { :x :b :c. :a :b :c. } => { :x :x :x }. @forSome :b. :a :b :c. :d :b :c.');
// console.log(terms+'');