
let Term = require('./Term');

class Constant extends Term
{
    constructor (value)
    {
        super();
        this.value = value;
    }
    
    equals (other)
    {
        return other instanceof Constant && this.value === other.value;
    }
    
    applyMapping (map)
    {
        return this;
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null})
    {
        return [this];
    }
    
    fromSNF ()
    {
        return {result: this, vars: new Set(), order: []};
    }
    
    updateQuantifiers ()
    {
        return [this];
    }
    
    solveDeep (map, forward, other)
    {
        return this.equals(other);
    }

    toString ()
    {
        return '<' + this.value + '>';
    }
}

module.exports = Constant;