
var Term = require('./Term');

class Skolem extends Term
{
    constructor (name, dependencies)
    {
        super();
        if (!(dependencies instanceof Set))
            throw new Error("Dependencies should be a Set.");
        this.name = name;
        this.dependencies = dependencies;
    }
    
    equals (other)
    {
        if (!(other instanceof Skolem))
            return false;
        if (this.name !== other.name)
            return false;
        if (this.dependencies.length !== other.dependencies.length)
            return false;
        
        for (let i = 0; i < this.dependencies.length; ++i)
            if (!this.dependencies[i].equals(other.dependencies[i]))
                return false;
        
        return true;
    }
    
    applyMapping (map)
    {
        return new Skolem(this.name, new Set([...this.dependencies].map(e => e.applyMapping(map))));
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        throw new Error("Is already in SNF!");
    }
    
    updateQuantifiers ()
    {
        return this;
    }
    
    solveAsLeft (map, forward, other)
    {
        // for backward: something exists, don't care what
        if (!forward)
            return true;
        
        return this.equals(other);
    }

    toString ()
    {
        return '#' + this.name + '(' + [...this.dependencies].join(', ') + ')';
    }
}

module.exports = Skolem;