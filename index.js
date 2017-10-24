
const Terms = require('./terms/Terms');
const ForwardReasoner = require('./reasoning/ForwardReasoner');
// const BackwardReasoner = require('./reasoning/BackwardReasoner'); // not exposing this until fixed
const N3Parser = require('./parsing/N3Parser');
const TermParser = require('./parsing/TermParser');

module.exports = {
  ForwardReasoner,
  N3Parser,
  TermParser,
  Terms
};