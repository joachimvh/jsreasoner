
let Term = require('./Term');

class Variable extends Term
{
    constructor (name)
    {
        super();
        this.name = name;
    }
    
    equals (other)
    {
        return other instanceof Variable && this.name === other.name;
    }
    
    applyMapping (map)
    {
        if (map.has(this.name))
            return map.get(this.name);
        return this;
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null })
    {
        return [this.applyMapping(status.map)];
    }
    
    fromSNF ()
    {
        // use name because else Set won't work?
        return {result: this, vars: new Set([this.name]), order: []};
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        if (!status.variables.has(this.name))
            throw new Error("Unidentified variable " + this.toString());
        return [new Variable(status.variables.get(this.name))];
    }
    
    solveDeep (map, forward, other)
    {
        if (!forward)
            return true;

        if (map.has(this.name))
            return other.equals(map.get(this.name));
        map.set(this.name, other);
        return true;
    }

    toString ()
    {
        return '$' + this.name;
    }
}

module.exports = Variable;