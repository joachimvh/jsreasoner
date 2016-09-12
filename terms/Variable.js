
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
        return this.applyMapping(status.map);
    }
    
    solve (map, forward, other)
    {
        let right = other.solveOnRight(map, forward, this);
        if (right !== undefined)
            return right;
        
        // should already be covered above
        if (!forward) return false;
        
        if (map.has(this.name))
            return other.equals(map.get(this.name));
        map.set(this.name, other);
        return true;
    }
    
    solveOnRight (map, forward, other)
    {
        if (forward) return true;
        
        // backward
        if (map.has(this.name))
            return this.equals(map.get(this.name));
        map.set(this.name, other);
        return true;
    }

    toString ()
    {
        return '?' + this.name;
    }
}

module.exports = Variable;