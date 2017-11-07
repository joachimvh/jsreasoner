
let List = require("./List");
let Implication = require ('./Implication');
let Quantifier = require('./Quantifier');
let Variable = require('./Variable');

class Formula extends List
{
    // TODO: should ignore order?
    applyMapping (map)
    {
        return new Formula(this.list.map(e => e.applyMapping(map)));
    }
    
    // Skolem/variable scope now stops at the edge of a formula, unless that formula is an implication component.
    // Reason for this is that the meaning of predicates might influence the interpretation.
    // E.g. {:J :denies { _:x a :Unicorn }} => { :J :is :crazy }.
    // In this case, the x should be converted to a universal when extracting from the formula due to the meaning of the predicate.
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null})
    {
        // if the parent isn't an implication scoping needs to stay within the formula
        if (!(status.parent instanceof Implication))
            status = { map: status.map, changeQuant: false, dependencies: status.dependencies, parent: this};
        return [new Formula([].concat(...this.list.map(e => e.toSNF(Object.assign(status, {parent: this})))))];
    }
    
    fromSNF (parent = null)
    {
        let vals = this.list.map(x => x.fromSNF(this));
        // fancy (and memory efficient way) to merge sets
        let mergedVars = this.mergeSets(vals.map(v => v.vars));
        let mergedOrder = this.mergeOrders(vals.map(v => v.order));
        let result = vals.map(x => x.result);
        
        if (parent instanceof Implication)
            return {result: new Formula(result), vars: mergedVars, order: mergedOrder};
            
        // need to add all vars not part of the order
        for (let v of mergedVars)
            if (mergedOrder.find(x => x.var.equals(v)) === undefined)
                result = [new Quantifier(true, new Variable(v), result)];
            
        for (let i = mergedOrder.length-1; i >= 0; --i)
            result = [new Quantifier(mergedOrder[i].universal, mergedOrder[i].var, result)];
        
        return {result: new Formula(result), vars: [], order: []};
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        return [new Formula([].concat(...this.list.map(e => e.updateQuantifiers(status))))];
    }

    toString ()
    {
        return '{ ' + this.list.join(' ') + ' }';
    }
}

module.exports = Formula;