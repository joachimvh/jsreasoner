
let Term = require('./Term');
let RdfString = require('rdf-string');


class Constant extends Term
{
    constructor (value)
    {
        super();
        // value should be RDF.js
        this.value = value;
    }
    
    equals (other)
    {
        return other instanceof Constant && this.value.equals(other.value);
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
        return RdfString.termToString(this.value);
    }
}

module.exports = Constant;