
let Lexer = require('n3-parser.js').N3Lexer;
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
        let {id} = this.step(lexed, new Map(), new Set());
        // result is a list (since we don't want an encapsulating formula around the document)
        return [].concat(...id.list.map(e => e.updateQuantifiers()));
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
                return { id: new T.Variable(val) };
            return { id: new T.Constant(val) };
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
                prefixes.set(prefix, uri.substring(1, uri.length-1));
            }
            else if (child.type === 'Universal' || child.type === 'Existential')
            {
                // all following statements need to be in scope of the quantifier
                // I will be very upset with whoever puts something that can return universals/existentials in the parameter position of the quantifier
                // or square bracket blank nodes, please don't
                // will actually break if non-constants are used for parameters for now
                for (let param of child.val)
                {
                    // TODO: prefixes
                    let p = this.step(param, prefixes, variables).id.value;
                    if (!p)
                        throw new Error('Someone put something weird as a quantifier parameter: ' + param);
                    let v = new T.Variable(p);
                    variables.add(v.name);
                    list.push({ quant: true, forAll: child.type === 'Universal', id: v}); // temporary object, will be parsed below
                }
            }
            else
            {
                // universal variables need to be scoped outside of the formula, existentials inside
                // prefixes only matter if they are directly one of the child values
                let {outerVariables: outer=[], innerVariables: inner=[], id, triples} = this.step(child, prefixes, variables);
                newInner.push(...inner);
                newOuter.push(...outer);
                if (id)
                    throw Error('id should be null here, it isn\'t: ' + id);
                list.push(...triples);
            }
        }
        if (list.length === 0)
            return {id: new T.Formula([])};
            
        for (let i = list.length-1; i >= 0; --i)
        {
            if (list[i].quant)
            {
                // cut off the tail of the list
                let subList = list.splice(i+1);
                // let the last element of the list be the new formula
                list[i] = new T.Quantifier(list[i].forAll, list[i].id, subList);
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
        result = new T.Formula(result);
        return {innerVariables: newOuter, id: result};
    }
    
    handleTripleData ({type, val}, prefixes, variables)
    {
        let sResult, poList;
        let newInner = [], newOuter = [];
        let triples = [];
        let id = null;
        if (type === 'TripleData')
        {
            let s = val[0];
            poList = val[1];
            let {innerVariables: inner=[], outerVariables: outer=[], id, triples: sTriples=[]} = this.step(s, prefixes, variables);
            newInner = inner;
            newOuter = outer;
            sResult = id;
            triples.push(...sTriples);
        }
        else // BlankTripleData
        {
            poList = val;
            sResult = new T.Variable('b_' + this.nameIdx++);
            id = sResult;
            newInner.push({ universal: false, term: sResult });
        }
    
        for (let po of poList)
        {
            let [p, os] = po.val;
            if (p.val === '=>')
            {
                for (let o of os)
                {
                    let {outerVariables: outer=[], innerVariables: inner=[], id: oResult, triples: sTriples=[]} = this.step(o, prefixes, variables);
                    newInner.push(...inner);
                    newOuter.push(...outer);
                    triples.push(...sTriples);
                    triples.push(new T.Implication(sResult, oResult));
                }
            }
            else
            {
                let {outerVariables: outer=[], innerVariables: inner=[], id: {p: pResult, os: oResults}, triples: sTriples=[]} = this.step(po, prefixes, variables);
                newInner.push(...inner);
                newOuter.push(...outer);
                triples.push(...sTriples);
                for (let oResult of oResults)
                  triples.push(new T.Triple(sResult, pResult, oResult));
            }
        }
        return {outerVariables: newOuter, innerVariables: newInner, triples, id};
    }
    
    handlePredicateObject ({type, val}, prefixes, variables)
    {
        let [p, os] = val;
        let {innerVariables: newInner=[], outerVariables: newOuter=[], id: pResult, triples=[]} = this.step(p, prefixes, variables);
        let oResults = [];
        for (let o of os)
        {
            let {innerVariables: inner=[], outerVariables: outer=[], id: oResult, triples: sTriples=[]} = this.step(o, prefixes, variables);
            newInner.push(...inner);
            newOuter.push(...outer);
            triples.push(...sTriples);
            oResults.push(oResult);
        }
        return {innerVariables: newInner, outerVariables: newOuter, id: {p: pResult, os: oResults}, triples};
    }
    
    handleList ({type, val}, prefixes, variables)
    {
        let newInner = [], newOuter = [];
        let list = [];
        let triples = [];
        for (let child of val)
        {
            let {innerVars=[], outerVars=[], id, triples: sTriples=[]} = this.step(child, prefixes, variables);
            newInner.push(...innerVars);
            newOuter.push(...outerVars);
            triples.push(...sTriples);
            if (id)
                list.push(id);
        }
        return {innerVariables: newInner, outerVariables: newOuter, id: new T.List(list), triples};
    }
    
    handleVariable ({type, val}, prefixes, variables)
    {
        let result = new T.Variable(val);
        return {outerVariables: [{ universal: true, term: result }], id: result};
    }
    
    handlePrefixedIRI ({type, val}, prefixes, variables)
    {
        let prefixIdx = val.indexOf(':');
        let prefix = val.substring(0, prefixIdx);
        if (prefix === '_')
        {
            let v = new T.Variable(val);
            return {id: v, innerVariables: [ { universal: false, term: v } ] };
        }
        
        if (variables.has(val))
            return {id: new T.Variable(val)};
        
        if (prefixes.has(prefix)) // TODO: store prefixes for nicer output
            return {id: new T.Constant(prefixes.get(prefix) + val.substring(prefixIdx+1))};
        return {id: new T.Constant(val)};
    }
}

module.exports = N3Parser;