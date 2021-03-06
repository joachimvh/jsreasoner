
let T = require('./../terms/Terms');

// TODO: nested rules?
class BackwardReasoner
{
    static reason (goals, knowledge)
    {
        knowledge = [].concat(...knowledge.map(k => k.toSNF()));
        goals = [].concat(...goals.map(g => g.toSNF()));
        let rules = knowledge.filter(k => k instanceof T.Implication);
        knowledge = knowledge.map(k => { return { data: k, evidence: []} });
        while (true)
        {
            let head = BackwardReasoner.step(goals, knowledge, rules).next().value;
            if (!head)
                return null;
            if (head.goals.length === 0)
                return head.knowledge;
            goals = head.goals;
            knowledge = head.knowledge;
        }
    }
    
    static *step (goals, knowledge, rules)
    {
        if (goals.length === 0)
            return yield { goals: [], knowledge: knowledge};
        let goal = goals[0];
    
        if (knowledge.find(({data, evidence}) => data.equals(goal)) !== undefined)
            yield* this.step(goals.slice(1), knowledge);
        else
        {
            for (let {map, rule} of BackwardReasoner.matchingRules(goal, rules))
            {
                let newGoals = BackwardReasoner.createGoals(rule, map);
                let evidence = [rule, ...newGoals];
                let newData = BackwardReasoner.createKnowledge(rule, map);
                rules.push(...newData.filter(d => d instanceof T.Implication));
                let newKnowledge = newData.map(k => { return { data: k, evidence: evidence}});
                yield { goals: [...goals.slice(1), ...newGoals], knowledge: [...knowledge, ...newKnowledge] };
            }
        }
    }
    
    static *matchingRules (goal, rules)
    {
        for (let rule of rules)
        {
            // TODO: find if any of the elements in rule.conclusion.list match the goal
            for (let conclusion of rule.conclusion.list)
            {
                let map = new Map();
                if (goal.solve(map, false, conclusion))
                    yield { map: map, rule: rule, match: conclusion };
            }
        }
    }
    
    static createGoals (rule, mapping)
    {
        return rule.premise.applyMapping(mapping).list;
    }
    
    static createKnowledge (rule, mapping)
    {
        return rule.conclusion.applyMapping(mapping).list;
    }
}

module.exports = BackwardReasoner;