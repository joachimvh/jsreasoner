
let Term = require('./Term');
let Quantifier = require('./Quantifier');

class Implication extends Term
{
    constructor (premise, conclusion)
    {
        super();
        this.premise = premise;
        this.conclusion = conclusion;
    }
    
    equals (other)
    {
        return other instanceof Implication && this.premise.equals(other.premise) && this.conclusion.equals(other.conclusion);
    }
    
    applyMapping (map)
    {
        return new Implication(this.premise.applyMapping(map), this.conclusion.applyMapping(map));
    }
    
    // TODO: similarity between toSNF and updateQuantifiers
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null})
    {
        let premise = this.premise.toSNF({map: status.map, changeQuant: !status.changeQuant, dependencies: status.dependencies, parent: this});
        let conclusion = this.conclusion.toSNF(Object.assign(status, {parent: this}));
        if (premise.length !== 1 || conclusion.length !== 1)
            throw new Error("Premise and conclusion should not be lists.");
        return [new Implication(premise[0], conclusion[0])];
    }
    
    fromSNF (parent = null)
    {
        let vals = [this.premise, this.conclusion].map(x => x.fromSNF(this));
        let implication = new Implication(...vals.map(x => x.result));
        // fancy (and memory efficient way) to merge sets
        let mergedVars = this.mergeSets(vals.map(v => v.vars));
        let mergedOrder = this.mergeOrders(vals.map(v => v.order));
        return {result: implication, vars: mergedVars, order: mergedOrder};
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        let premise = this.premise.updateQuantifiers(status);
        let conclusion = this.conclusion.updateQuantifiers(status);
        if (premise.length !== 1 || conclusion.length !== 1)
            throw new Error("Premise and conclusion should not be lists.");
        return [new Implication(premise[0], conclusion[0])];
    }
    
    solveAsLeft (map, forward, other)
    {
        if (!(other instanceof Implication))
            return false;
        
        return this.premise.solve(map, forward, other.premise) && this.conclusion.solve(map, forward, other.conclusion);
    }

    toString ()
    {
        return this.premise + ' => ' + this.conclusion + '.';
    }
}

module.exports = Implication;