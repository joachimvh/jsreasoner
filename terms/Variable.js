
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
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        return [this.applyMapping(status.map)];
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        if (!status.variables.has(this.name))
            throw new Error("Unidentified variable " + this.toString());
        return [new Variable(status.variables.get(this.name))];
    }
    
    solveAsLeft (map, forward, other)
    {
        // should already be covered on right side
        if (!forward) return false;
        
        if (map.has(this.name))
            return other.equals(map.get(this.name));
        map.set(this.name, other);
        return true;
    }
    
    solveAsRight (map, forward, other)
    {
        if (forward) return true;
        
        // backward
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