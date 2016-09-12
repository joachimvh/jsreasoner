
let Constant = require("./terms/Constant");
let Implication = require("./terms/Implication");
let Formula = require("./terms/Formula");

class Reasoner
{
    static reason (knowledge)
    {
        knowledge = knowledge.map(k => { return { data: k, evidence: []} });
        while (true)
        {
            let head = Reasoner.step(knowledge).next().value;
            if (!head)
                return knowledge;
            knowledge.push(...head);
        }
    }
    
    static *step (knowledge)
    {
        let rules = knowledge.filter(({data, evidence}) => data instanceof Implication).map(({data, evidence}) => data);
        for (let rule of rules)
        {
            for (let {map: map, evidence: evidence} of Reasoner.solvePremise(rule.premise, knowledge))
            {
                let data = rule.conclusion.applyMapping(map); // let's just assume the conclusion is a formula for now
                if (data.list.some(d => knowledge.filter(({data, evidence}) => data.equals(d)).length === 0)) // TODO: `find` not working yet?
                    yield data.list.map(d => { return { data: d, evidence: [rule, ...evidence] }});
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
            if (premise.list.lletength === 0)
                yield {map: map, evidence: []};
            else if (premise.list.length === 1)
                yield* Reasoner.solvePremise(premise.list[0], knowledge, map);
            else
            {
                let [head, ...tail] = premise.list;
                for (let {map: headMap, evidence: headEvidence} of Reasoner.solvePremise(head, knowledge, map))
                {
                    let tailGen = Reasoner.solvePremise(new Formula(tail), function*() {for (let {data, evidence} of knowledge) yield {data: data.applyMapping(headMap), evidence: evidence}}(), headMap);
                    for (let {map: tailMap, evidence: tailEvidence} of tailGen)
                        yield {map: new Map(function*() { yield* headMap; yield* tailMap; }()), evidence: [...headEvidence, ...tailEvidence]};
                }
            }
        }
        else
        {
            for (let {data, evidence} of knowledge)
            {
                let newMap = new Map(map);
                if (premise.solve(newMap, true, data))
                    yield { map: newMap, evidence: [data] };
            }
        }
    }
}

module.exports = Reasoner;