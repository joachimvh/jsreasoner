
var Constant = require("./terms/Constant");
var Implication = require("./terms/Implication");
var Formula = require("./terms/Formula");

class Reasoner
{
    static reason (knowledge)
    {
        while (true)
        {
            var head = Reasoner.step(knowledge).next().value;
            if (!head)
                return knowledge;
            knowledge.push(...head.data);
        }
    }
    
    static *step (knowledge)
    {
        var rules = knowledge.filter(k => k instanceof Implication);
        for (let rule of rules)
        {
            for (let {map: map, evidence: evidence} of Reasoner.solvePremise(rule.premise, knowledge))
            {
                let data = rule.conclusion.applyMapping(map); // let's just assume the conclusion is a formula for now
                if (data.list.some(d => knowledge.filter(k => k.equals(d)).length === 0)) // TODO: `find` not working yet?
                    yield { data: data.list, evidence: [rule, ...evidence] };
            }
        }
    }
    
    static *solvePremise (premise, knowledge, map = new Map())
    {
        if (premise instanceof Constant)
        {
            if (premise.value === true)
                yield {map: map, evidence: []};
        }
        else if (premise instanceof Formula)
        {
            if (premise.list.length === 0)
                yield {map: map, evidence: []};
            else if (premise.list.length === 1)
                yield* Reasoner.solvePremise(premise.list[0], knowledge, map);
            else
            {
                let [head, ...tail] = premise.list;
                for (let {map: headMap, evidence: headEvidence} of Reasoner.solvePremise(head, knowledge, map))
                {
                    let tailGen = Reasoner.solvePremise(new Formula(tail), function*() {for (let k of knowledge) yield k.applyMapping(headMap)}(), headMap);
                    for (let {map: tailMap, evidence: tailEvidence} of tailGen)
                        yield {map: new Map(function*() { yield* headMap; yield* tailMap; }()), evidence: [...headEvidence, ...tailEvidence]};
                }
            }
        }
        else
        {
            for (let know of knowledge)
            {
                let newMap = new Map(map);
                if (premise.solve(newMap, true, know))
                    yield { map: newMap, evidence: [know] };
            }
        }
    }
}

module.exports = Reasoner;