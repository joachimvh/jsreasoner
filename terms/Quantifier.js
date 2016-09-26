
let Term = require('./Term');
let Skolem = require('./Skolem');
let Formula = require('./Formula');
let Variable = require('./Variable');

class Quantifier extends Term
{
    constructor (forAll, param, list)
    {
        super();
        if (!(param instanceof Variable))
            throw new Error("Only variables are supported as quantifier parameters");
        this.forAll = forAll;
        this.param = param;
        this.list = list;
    }
    
    equals (other)
    {
        return other instanceof Quantifier && this.param.equals(other.param) && this.formula.equals(other.formula);
    }
    
    applyMapping (map)
    {
        throw new Error("Should be in SNF.");
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null})
    {
        // could optimize to only copy the necessary parts
        status = { map: new Map(status.map), changeQuant: status.changeQuant, dependencies: new Set(status.dependencies), parent: status.parent };
        if (this.forAll && status.changeQuant || !this.forAll && !status.changeQuant)
            status.map.set(this.param.name, new Skolem(this.param.name, status.dependencies));
        else
            status.dependencies.add(this.param);
        
        return [].concat(...this.list.map(e => e.toSNF(status)));
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        if (status.variables.has(this.param.name))
            return [].concat(...this.list.map(e => e.updateQuantifiers(status)));
        // need to duplicate set to make sure this variables stays in the correct scope
        let newStatus = {variables: new Map(status.variables), nameIdx: status.nameIdx};
        let varName = 'v_' + newStatus.nameIdx++;
        newStatus.variables.set(this.param.name, varName);
        let newList = [].concat(...this.list.map(e => e.updateQuantifiers(newStatus)));
        status.nameIdx = newStatus.nameIdx; // make sure the idx value gets propagated
        return [new Quantifier(this.forAll, new Variable(varName), newList)];
    }

    toString ()
    {
        return (this.forAll ? '∀ ' : '∃ ') + this.param + ': ' + this.list.join(' ') + '';
    }
}

module.exports = Quantifier;