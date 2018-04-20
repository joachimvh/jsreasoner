# JS Reasoner
A simple inference engine for Notation3 (N3) that can do forward or backward reasoning
and also handles the correct scoping and interpretation of N3 files.

## Example
```javascript
let terms = N3Parser.toTerms(':a :k :o. :a :b :c. {?x :b :c}=>{?x :q :x}. {:a :q ?z. :a :k ?y}=>{:p :p ?y}.');
let goals = N3Parser.toTerms(':p :p :o.');
console.log('FORWARD REASONING');
console.log(ForwardReasoner.reason(terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
console.log('BACKWARD REASONING');
console.log(BackwardReasoner.reason(goals, terms).map(({data, evidence}) => [data, ...evidence].join('\n    ')).join('\n'));
```