
let Term = require('./Term');
let Skolem = require('./Skolem');
let Formula = require('./Formula');

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
    
    updateQuantifiers (variables = new Set())
    {
        if (variables.has(this.param.name))
            return this.formula.updateQuantifiers(variables);
        // need to duplicate set to make sure this variables stays in the correct scope
        variables = new Set(variables);
        variables.add(this.param.name);
        return new Quantifier(this.forAll, this.param, this.formula.updateQuantifiers(variables));
    }

    toString ()
    {
        return (this.forAll ? '{∀ ' : '{∃ ') + this.param + ': ' + (this.formula instanceof Formula ? this.formula.list.join(' ') : this.formula) + '}';
    }
}

module.exports = Quantifier;