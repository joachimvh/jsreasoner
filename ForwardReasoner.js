
let T = require('./terms/Terms');

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
        let rules = knowledge.filter(({data, evidence}) => data instanceof T.Implication).map(({data, evidence}) => data);
        for (let rule of rules)
        {
            for (let {map: map, evidence: evidence} of Reasoner.solvePremise(rule.premise, knowledge))
            {
                let data = rule.conclusion.applyMapping(map); // let's just assume the conclusion is a formula for now
                let newEvidence = [rule, ...evidence];
                if (data.list.some(d => knowledge.find(({data, evidence}) => data.equals(d)) === undefined))
                    yield data.list.map(d => { return { data: d, evidence: newEvidence }});
            }
        }
    }
    
    static *solvePremise (premise, knowledge, map = new Map())
    {
        if (premise instanceof T.Constant)
        {
            if (premise.value === true)
                yield {map: map, evidence: []};
        }
        else if (premise instanceof T.Formula)
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
                    let tailGen = Reasoner.solvePremise(new T.Formula(tail), function*() {for (let {data, evidence} of knowledge) yield {data: data.applyMapping(headMap), evidence: evidence}}(), headMap);
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