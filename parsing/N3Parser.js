
// TODO: start from parser or lexer? parser has the advantage of already handling some of the interpretation but does decrease performance
let Lexer = require('n3parser').N3Lexer;
let T = require('../terms/Terms');
let _ = require('lodash');

// TODO: handle renaming of variables at some point
class N3Parser
{
    constructor()
    {
        this.blankIdx = 0;
    }

    toTerms (input)
    {
        this.blankIdx = 0;
        let lexed = new Lexer().parse(input);
        return lexed;
    }

    step (thingy, prefixes, variables)
    {
        // TODO: quantifiers when implemented in Lexer
        let {type, val} = thingy;
        if (type === 'Document' || type === 'Formula')
        {
            let list = [];
            let newUniversals = [];
            let newExistentials = [];
            prefixes = [...prefixes];
            for (let child of val)
            {
                if (child.type === 'Prefix')
                {
                    let [prefix, uri] = child.val;
                    prefixes.push({[prefix]: uri});
                }
                else
                {
                    // universal variables need to be scoped outside of the formula, existentials inside
                    // prefixes only matter if they are directly one of the child values
                    let {variables: {universals=[], existentials=[]}, result} = N3Parser.step(child);
                    newUniversals.push(...universals);
                    newExistentials.push(...existentials);
                    list.push(...result);
                }
            }
            let result = new T.Formula(list);
            for (let existential of newExistentials)
                result = new T.Quantifier(false, existential, result);
            return {variables: {unversals: newUniversals}, result: result};
        }
        else if (type === 'TripleData' || type === 'BlankTripleData')
        {
            let sResult, poList;
            let newUniversals = [], newExistentials = [];
            if (type === 'TripleData')
            {
                let s = val[0];
                poList = val[1];
                let {variables: {universals: sUniverals=[], existentials: sExistentials=[]}, result: result} = N3Parser.step(s);
                newUniversals = sUniverals;
                newExistentials = sExistentials;
                sResult = result;
            }
            else // BlankTripleData
            {
                poList = val[0];
                sResult = new T.Variable('b_' + this.blankIdx++);
                newExistentials.push(sResult);
            }

            let results = [];
            for (let po of poList)
            {
                let [p, os] = po;
                if (p.val === '=>')
                {
                    for (let o of os)
                    {
                        let {variables: {universals: oUniversals=[]}, result: oResult};
                        let result = new T.Implication(sResult, oResult);
                        for (let universal of oUniversals)
                            result = new T.Quantifier(true, universal, result);
                        results.push(result);
                    }
                }
                else
                {
                    let {variables: {universals: poUniverals=[], existentials: poExistentials=[]}, result: {p: pResult, os: oResults}} = N3Parser.step(po);
                    newUniversals.push(...poUniverals);
                    newExistentials.push(...poExistentials);
                    for (let oResult of oResults)
                        results.push(new T.Triple(sResult, pResult, oResult));
                }
            }
            return {variables: {universals: newUniversals, existentials: newExistentials}, result: results};
        }
        else if (type === 'PredicateObject')
        {
            let [p, os] = val;
            let {variables: {universals: newUniverals=[], existentials: newExistentials=[]}, result: pResult} = N3Parser.step(p);
            let oResults = [];
            for (let o of os)
            {
                let {variables: {universals: oUniverals=[], existentials: oExistentials=[]}, result: oResult} = N3Parser.step(o);
                newUniverals.push(...oUniverals);
                newExistentials.push(...oExistentials);
                oResults.push(oResult);
            }
            return {variables: {universals: newUniverals, existentials: newExistentials}, result: {p: pResult, os: oResults}};
        }
        else if (type === 'List')
        {
            let newUniversals = [], newExistentials = [];
            let list = [];
            for (let child of val)
            {
                let {variables: {universals=[], existentials=[]}, result} = N3Parser.step(child);
                newUniversals.push(...universals);
                newExistentials.push(...existentials);
                list.push(result);
            }
            return {variables: {universals: newUniversals, existentials: newExistentials}}
        }
    }
}

module.exports = N3Parser;