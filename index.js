
const Terms = require('./terms/Terms');
const ForwardReasoner = require('./reasoning/ForwardReasoner');
const BackwardReasoner = require('./reasoning/BackwardReasoner');
const N3Parser = require('./parsing/N3Parser');
const TermParser = require('./parsing/TermParser');

module.exports = {
  ForwardReasoner,
  BackwardReasoner,
  N3Parser,
  TermParser,
  Terms
};