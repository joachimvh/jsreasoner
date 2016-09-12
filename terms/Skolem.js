
class Skolem extends Term
{
    constructor (name, dependencies)
    {
        this.name = name;
        this.dependencies = dependencies;
    }
    
    equals (other)
    {
        if (! other instanceof Skolem)
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
        return new Skolem(this.name, this.dependencies.map(e => e.applyMapping(map)));
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        throw new Error("Is already in SNF!");
    }
    
    solve (map, forward, other)
    {
        let parentResult = super.solve(map, forward, other);
        if (parentResult !== undefined)
            return parentResult;
        
        // for backward: something exists, don't care what
        if (!forward)
            return true;
        
        return this.equals(other);
    }
}