
var Term = require('./Term');

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
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        return new Implication(this.premise.toSNF({map: status.map, changeQuant: !status.changeQuant, dependencies: status.dependencies}), this.conclusion.toSNF(map));
    }
    
    solve (map, forward, other)
    {
        let right = other.solveOnRight(map, forward, this);
        if (right !== undefined)
            return right;
        
        if (!other instanceof Implication)
            return false;
        
        return this.premise.solve(map, forward, other.premise) && this.conclusion.solve(map, forward, other.conclusion);
    }

    toString ()
    {
        return this.premise + ' => ' + this.conclusion + '.';
    }
}

module.exports = Implication;