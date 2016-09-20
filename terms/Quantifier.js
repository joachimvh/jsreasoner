
let Term = require('./Term');
let Skolem = require('./Skolem');

class Quantifier extends Term
{
    constructor (forAll, param, formula)
    {
        super();
        this.forAll = forAll;
        this.param = param;
        this.formula = formula;
    }
    
    equals (other)
    {
        return other instanceof Quantifier && this.param.equals(other.param) && this.formula.equals(other.formula);
    }
    
    applyMapping (map)
    {
        throw new Error("Should be in SNF.");
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        if (this.forAll && status.changeQuant || !this.forAll && !status.changeQuant)
            status.map.set(this.param, new Skolem(this.param, status.dependencies));
        else
            status.dependencies.add(this.param);
        
        return this.formula.toSNF(status);
    }

    toString ()
    {
        return (this.forAll ? '∀ ' : '∃ ') + this.param + ': (' + this.formula + ')';
    }
}

module.exports = Quantifier;