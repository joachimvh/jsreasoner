
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
        let {variables: {universals=[]}, result} = this.step(lexed, new Map(), new Set());
        for (let universal of universals)
            result = new T.Quantifier(true, universal, result);
        return result;
    }

    step (thingy, prefixes, variables)
    {
        let {type, val} = thingy;
        if (type === 'Document' || type === 'Formula')
            return this.handleFormula(thingy, prefixes, variables);
        else if (type === 'TripleData' || type === 'BlankTripleData')
            return this.handleTripleData(thingy, prefixes, variables);
        else if (type === 'PredicateObject')
            return this.handlePredicateObject(thingy, prefixes, variables);
        else if (type === 'List')
            return this.handleList(thingy, prefixes, variables);
        else if (type === 'Variable')
            return this.handleVariable(thingy, prefixes, variables);
        else if (type === 'PrefixedIRI')
            return this.handlePrefixedIRI(thingy, prefixes, variables);
        else
            // Totally complete
        {
            if (variables.has(val))
                return { result: new T.Variable(val), variables: {} };
            return { result: new T.Constant(val), variables: {} };
        }
    }
    
    handleFormula({type, val}, prefixes, variables)
    {
        let list = [];
        let newUniversals = [];
        let newExistentials = [];
        prefixes = new Map(prefixes);
        variables = new Set(variables); // clone since some variable names might be re-used later as non-variables (please don't do that though)
        for (let child of val)
        {
            if (child.type === 'Prefix')
            {
                let [prefix, uri] = child.val;
                prefixes.set(prefix, uri);
            }
            else if (child.type === 'Universal' || child.type === 'Existential')
            {
                // all following statements need to be in scope of the quantifier
                // I will be very upset with whoever puts something that can return universals/existentials in the parameter position of the quantifier
                // will actually break if non-constants are used for parameters for now
                for (let param of child.val)
                {
                    let v = new T.Variable(this.step(param, prefixes, variables).result.value);
                    list.push({ quant: true, forAll: child.type === 'Universal', result: v});
                    variables.add(v.name)
                }
            }
            else
            {
                // universal variables need to be scoped outside of the formula, existentials inside
                // prefixes only matter if they are directly one of the child values
                let {variables: {universals=[], existentials=[]}, result} = this.step(child, prefixes, variables);
                newUniversals.push(...universals);
                newExistentials.push(...existentials);
                list.push(...result);
            }
        }
        if (list.length === 0)
            return {result: new T.Formula([])};
            
        for (let i = list.length-1; i >= 0; --i)
        {
            if (list[i].quant)
            {
                // cut off the tail of the list
                let subList = list.splice(i+1);
                // let the last element of the list be the new formula
                list[i] = new T.Quantifier(list[i].forAll, list[i].result, new T.Formula(subList));
            }
        }
        let result = list[0];
        if (!(result instanceof T.Formula || result instanceof T.Quantifier) || list.length > 1)
            result = new T.Formula(list);
        for (let existential of newExistentials)
            result = new T.Quantifier(false, existential, result);
        return {variables: {universals: newUniversals}, result: result};
    }
    
    handleTripleData ({type, val}, prefixes, variables)
    {
        let sResult, poList;
        let newUniversals = [], newExistentials = [];
        if (type === 'TripleData')
        {
            let s = val[0];
            poList = val[1];
            let {variables: {universals: sUniverals=[], existentials: sExistentials=[]}, result: result} = this.step(s, prefixes, variables);
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
                    let {variables: {universals: oUniversals=[]}, result: oResult} = this.step(o, prefixes, variables);
                    let result = new T.Implication(sResult, oResult);
                    for (let universal of oUniversals)
                        result = new T.Quantifier(true, universal, result);
                    results.push(result);
                }
            }
            else
            {
                let {variables: {universals: poUniverals=[], existentials: poExistentials=[]}, result: {p: pResult, os: oResults}} = this.step(po, prefixes, variables);
                newUniversals.push(...poUniverals);
                newExistentials.push(...poExistentials);
                for (let oResult of oResults)
                    results.push(new T.Triple(sResult, pResult, oResult));
            }
        }
        return {variables: {universals: newUniversals, existentials: newExistentials}, result: results};
    }
    
    handlePredicateObject ({type, val}, prefixes, variables)
    {
        let [p, os] = val;
        let {variables: {universals: newUniverals=[], existentials: newExistentials=[]}, result: pResult} = this.step(p, prefixes, variables);
        let oResults = [];
        for (let o of os)
        {
            let {variables: {universals: oUniverals=[], existentials: oExistentials=[]}, result: oResult} = this.step(o, prefixes, variables);
            newUniverals.push(...oUniverals);
            newExistentials.push(...oExistentials);
            oResults.push(oResult);
        }
        return {variables: {universals: newUniverals, existentials: newExistentials}, result: {p: pResult, os: oResults}};
    }
    
    handleList ({type, val}, prefixes, variables)
    {
        let newUniversals = [], newExistentials = [];
        let list = [];
        for (let child of val)
        {
            let {variables: {universals=[], existentials=[]}, result} = this.step(child, prefixes, variables);
            newUniversals.push(...universals);
            newExistentials.push(...existentials);
            list.push(result);
        }
        return {variables: {universals: newUniversals, existentials: newExistentials}}
    }
    
    handleVariable ({type, val}, prefixes, variables)
    {
        let result = new T.Variable(val.substring(1));
        return {variables: {universals: [result]}, result: result};
    }
    
    handlePrefixedIRI ({type, val}, prefixes, variables)
    {
        let prefixIdx = val.indexOf(':');
        var prefix = val.substring(0, prefixIdx);
        if (prefix === '_')
        {
            let v = new T.Variable(val.substring(prefixIdx + 1));
            return {result: v, variables: {existentials: [v]}};
        }
        
        if (variables.has(val))
            return {result: new T.Variable(val), variables: {}};
        return {result: new T.Constant(val), variables: {}};
    }
}

module.exports = N3Parser;