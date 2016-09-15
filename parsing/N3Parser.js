
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
        // there should be no existentials left since these get covered in 'Document'
        let {variables: {universals=[]}, result} = this.step(lexed, new Map());
        for (let universal of universals)
            result = new T.Quantifier(true, universal, result);
        return result;
    }

    step (thingy, prefixes)
    {
        // TODO: quantifiers when implemented in Lexer
        let {type, val} = thingy;
        if (type === 'Document' || type === 'Formula')
            return this.handleFormula(thingy, prefixes);
        else if (type === 'TripleData' || type === 'BlankTripleData')
            return this.handleTripleData(thingy, prefixes);
        else if (type === 'PredicateObject')
            return this.handlePredicateObject(thingy, prefixes);
        else if (type === 'List')
            return this.handleList(thingy, prefixes);
        else if (type === 'Variable')
            return this.handleVariable(thingy, prefixes);
        else if (type === 'PrefixedIRI')
            return this.handlePrefixedIRI(thingy, prefixes);
        else
            // Totally complete
            return {result: new T.Constant(val), variables: {}};
    }
    
    handleFormula({type, val}, prefixes)
    {
        let list = [];
        let newUniversals = [];
        let newExistentials = [];
        prefixes = new Map(prefixes);
        for (let child of val)
        {
            if (child.type === 'Prefix')
            {
                let [prefix, uri] = child.val;
                prefixes.set(prefix, uri);
            }
            else
            {
                // universal variables need to be scoped outside of the formula, existentials inside
                // prefixes only matter if they are directly one of the child values
                let {variables: {universals=[], existentials=[]}, result} = this.step(child, prefixes);
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
    
    handleTripleData ({type, val}, prefixes)
    {
        let sResult, poList;
        let newUniversals = [], newExistentials = [];
        if (type === 'TripleData')
        {
            let s = val[0];
            poList = val[1];
            let {variables: {universals: sUniverals=[], existentials: sExistentials=[]}, result: result} = this.step(s, prefixes);
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
            let [p, os] = po.val;
            if (p.val === '=>')
            {
                for (let o of os)
                {
                    let {variables: {universals: oUniversals=[]}, result: oResult} = this.step(o, prefixes);
                    let result = new T.Implication(sResult, oResult);
                    for (let universal of oUniversals)
                        result = new T.Quantifier(true, universal, result);
                    results.push(result);
                }
            }
            else
            {
                let {variables: {universals: poUniverals=[], existentials: poExistentials=[]}, result: {p: pResult, os: oResults}} = this.step(po, prefixes);
                newUniversals.push(...poUniverals);
                newExistentials.push(...poExistentials);
                for (let oResult of oResults)
                    results.push(new T.Triple(sResult, pResult, oResult));
            }
        }
        return {variables: {universals: newUniversals, existentials: newExistentials}, result: results};
    }
    
    handlePredicateObject ({type, val}, prefixes)
    {
        let [p, os] = val;
        let {variables: {universals: newUniverals=[], existentials: newExistentials=[]}, result: pResult} = this.step(p, prefixes);
        let oResults = [];
        for (let o of os)
        {
            let {variables: {universals: oUniverals=[], existentials: oExistentials=[]}, result: oResult} = this.step(o, prefixes);
            newUniverals.push(...oUniverals);
            newExistentials.push(...oExistentials);
            oResults.push(oResult);
        }
        return {variables: {universals: newUniverals, existentials: newExistentials}, result: {p: pResult, os: oResults}};
    }
    
    handleList ({type, val}, prefixes)
    {
        let newUniversals = [], newExistentials = [];
        let list = [];
        for (let child of val)
        {
            let {variables: {universals=[], existentials=[]}, result} = this.step(child, prefixes);
            newUniversals.push(...universals);
            newExistentials.push(...existentials);
            list.push(result);
        }
        return {variables: {universals: newUniversals, existentials: newExistentials}}
    }
    
    handleVariable ({type, val}, prefixes)
    {
        let result = new T.Variable(val.substring(1));
        return {variables: {universals: [result]}, result: result};
    }
    
    handlePrefixedIRI ({type, val}, prefixes)
    {
        let prefixIdx = val.indexOf(':');
        var prefix = val.substring(0, prefixIdx);
        if (prefix === '_')
        {
            let v = new T.Variable(val.substring(prefixIdx + 1));
            return {result: v, variables: {existentials: [v]}};
        }
        else if (prefixes.has(prefix))
            return {result: new T.Constant(prefixes[prefix] + val.substring(prefixIdx + 1)), variables: {}};
        else
            return {result: new T.Constant(val), variables: {}};
    }
}

module.exports = N3Parser;