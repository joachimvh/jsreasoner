
let Term = require('./Term');
let Skolem = require('./Skolem');
let Formula = require('./Formula');
let Variable = require('./Variable');

class Quantifier extends Term
{
    constructor (forAll, param, formula)
    {
        super();
        if (!(param instanceof Variable))
            throw new Error("Only variables are supported as quantifier parameters");
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
        // could optimize to only copy the necessary parts
        status = { map: new Map(status.map), changeQuant: status.changeQuant, dependencies: new Set(status.dependencies)};
        if (this.forAll && status.changeQuant || !this.forAll && !status.changeQuant)
            status.map.set(this.param.name, new Skolem(this.param.name, status.dependencies));
        else
            status.dependencies.add(this.param);
        
        return this.formula.toSNF(status);
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        if (status.variables.has(this.param.name))
            return this.formula.updateQuantifiers(status);
        // need to duplicate set to make sure this variables stays in the correct scope
        let newStatus = {variables: new Map(status.variables), nameIdx: status.nameIdx};
        let varName = 'v_' + newStatus.nameIdx++;
        newStatus.variables.set(this.param.name, varName);
        let newFormula = this.formula.updateQuantifiers(newStatus);
        status.nameIdx = newStatus.nameIdx; // make sure the idx value gets propagated
        return new Quantifier(this.forAll, new Variable(varName), newFormula);
    }

    toString ()
    {
        return (this.forAll ? '{∀ ' : '{∃ ') + this.param + ': ' + (this.formula instanceof Formula ? this.formula.list.join(' ') : this.formula) + '}';
    }
}

module.exports = Quantifier;