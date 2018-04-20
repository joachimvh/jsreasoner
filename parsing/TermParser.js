
let T = require('../terms/Terms');

class TermParser
{
    static fromSNF (terms)
    {
        let vals = terms.map(t => t.fromSNF());
    
        // TODO: this is copy/pasted from formula fromSNF...
        // TODO: totally how to use membership functions
        let DUMMY = new T.Formula([]);
        let mergedVars = DUMMY.mergeSets(vals.map(v => v.vars));
        let mergedOrder = DUMMY.mergeOrders(vals.map(v => v.order));
        let result = vals.map(x => x.result);
    
        // need to add all vars not part of the order
        for (let v of mergedVars)
            if (mergedOrder.find(x => x.var.equals(v)) === undefined)
                result = [new T.Quantifier(true, new T.Variable(v), result)];
    
        for (let i = mergedOrder.length-1; i >= 0; --i)
            result = [new T.Quantifier(mergedOrder[i].universal, mergedOrder[i].var, result)];
        
        return result.map(t => t.updateQuantifiers());
    }
}

module.exports = TermParser;