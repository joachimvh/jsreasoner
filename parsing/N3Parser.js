
let Lexer = require('n3parser').N3Lexer;
let T = require('../terms/Terms');
let _ = require('lodash');

// TODO: handle renaming of variables at some point
class N3Parser
{
    constructor()
    {
        this.nameIdx = 0;
    }

    toTerms (input)
    {
        this.nameIdx = 0;
        let lexed = new Lexer().parse(input);
        // there should be no outer variables left since a 'Document' only returns inner
        let {result} = this.step(lexed, new Map(), new Set());
        // result is a list (since we don't want an encapsulating formula around the document)
        return [].concat(...result.map(e => e.updateQuantifiers()));
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
                return { result: new T.Variable(val) };
            return { result: new T.Constant(val) };
        }
    }
    
    handleFormula({type, val}, prefixes, variables)
    {
        let list = [];
        let newInner = [];
        let newOuter = [];
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
                    let p = this.step(param, prefixes, variables).result.value;
                    let v = new T.Variable(p);
                    variables.add(v.name);
                    list.push({ quant: true, forAll: child.type === 'Universal', result: v});
                }
            }
            else
            {
                // universal variables need to be scoped outside of the formula, existentials inside
                // prefixes only matter if they are directly one of the child values
                let {outerVariables: outer=[], innerVariables: inner=[], result} = this.step(child, prefixes, variables);
                newInner.push(...inner);
                newOuter.push(...outer);
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
                list[i] = new T.Quantifier(list[i].forAll, list[i].result, subList);
            }
        }
        let result = list;
        // TODO: first universals, then existentials
        for (let {term, universal} of newInner)
            result = [new T.Quantifier(universal, term, result)];
        if (type === 'Document')
        {
            for (let {term, universal} of newOuter)
                result = [new T.Quantifier(universal, term, result)];
            newOuter = undefined;
        }
        else
            result = new T.Formula(result);
        return {innerVariables: newOuter, result: result};
    }
    
    handleTripleData ({type, val}, prefixes, variables)
    {
        let sResult, poList;
        let newInner = [], newOuter = [];
        if (type === 'TripleData')
        {
            let s = val[0];
            poList = val[1];
            let {innerVariables: inner=[], outerVariables: outer=[], result: result} = this.step(s, prefixes, variables);
            newInner = inner;
            newOuter = outer;
            sResult = result;
        }
        else // BlankTripleData
        {
            poList = val[0];
            sResult = new T.Variable('b_' + this.nameIdx++);
            newInner.push({ universal: false, term: sResult });
        }
    
        let results = [];
        for (let po of poList)
        {
            let [p, os] = po.val;
            if (p.val === '=>')
            {
                for (let o of os)
                {
                    let {outerVariables: outer=[], innerVariables: inner=[], result: oResult} = this.step(o, prefixes, variables);
                    newInner.push(...inner);
                    newOuter.push(...outer);
                    results.push(new T.Implication(sResult, oResult));
                }
            }
            else
            {
                let {outerVariables: outer=[], innerVariables: inner=[], result: {p: pResult, os: oResults}} = this.step(po, prefixes, variables);
                newInner.push(...inner);
                newOuter.push(...outer);
                for (let oResult of oResults)
                    results.push(new T.Triple(sResult, pResult, oResult));
            }
        }
        return {outerVariables: newOuter, innerVariables: newInner, result: results};
    }
    
    handlePredicateObject ({type, val}, prefixes, variables)
    {
        let [p, os] = val;
        let {innerVariables: newInner=[], outerVariables: newOuter=[], result: pResult} = this.step(p, prefixes, variables);
        let oResults = [];
        for (let o of os)
        {
            let {innerVariables: inner=[], outerVariables: outer=[], result: oResult} = this.step(o, prefixes, variables);
            newInner.push(...inner);
            newOuter.push(...outer);
            oResults.push(oResult);
        }
        return {innerVariables: newInner, outerVariables: newOuter, result: {p: pResult, os: oResults}};
    }
    
    handleList ({type, val}, prefixes, variables)
    {
        let newInner = [], newOuter = [];
        let list = [];
        for (let child of val)
        {
            let {innerVars=[], outerVars=[], result} = this.step(child, prefixes, variables);
            newInner.push(...innerVars);
            newOuter.push(...outerVars);
            list.push(result);
        }
        return {innerVariables: newInner, outerVariables: newOuter}
    }
    
    handleVariable ({type, val}, prefixes, variables)
    {
        let result = new T.Variable(val);
        return {outerVariables: [{ universal: true, term: result }], result: result};
    }
    
    handlePrefixedIRI ({type, val}, prefixes, variables)
    {
        let prefixIdx = val.indexOf(':');
        var prefix = val.substring(0, prefixIdx);
        if (prefix === '_')
        {
            let v = new T.Variable(val);
            return {result: v, innerVariables: [ { universal: false, term: v } ] };
        }
        
        if (variables.has(val))
            return {result: new T.Variable(val)};
        return {result: new T.Constant(val)};
    }
}

module.exports = N3Parser;