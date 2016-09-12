
let Constant = require("./terms/Constant");
let Variable = require("./terms/Variable");
let Implication = require("./terms/Implication");
let Triple = require("./terms/Triple");
let Formula = require("./terms/Formula");
let Reasoner = require("./Reasoner");

let rule = new Implication(new Formula([new Triple(new Variable("x"), new Constant("b"), new Constant("c"))]),
                           new Formula([new Triple(new Variable("x"), new Variable("x"), new Variable("x"))]));
let rule2 = new Implication(new Formula([new Triple(new Variable("x"), new Constant("b"), new Constant("c")),
                                         new Triple(new Constant("a"), new Constant("b"), new Constant("c"))]),
                            new Formula([new Triple(new Variable("x"), new Variable("x"), new Variable("x"))]));
let triple = new Triple(new Constant("a"), new Constant("b"), new Constant("c"));
let triple2 = new Triple(new Constant("d"), new Constant("b"), new Constant("c"));

//console.log(rule);

let m = new Map();
rule.premise.list[0].solve(m, true, triple);
//console.log(m);

// var gen = Reasoner.step([rule2, triple, triple2]);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);
// console.log(gen.next().value);

console.log(Reasoner.reason([rule2, triple, triple2]).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));