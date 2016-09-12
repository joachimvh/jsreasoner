
var Term = require('./Term');

class List extends Term
{
    constructor (list)
    {
        super();
        this.list = list;
    }
    
    equals (other)
    {
        if (!other instanceof List)
            return false;
        if (this.list.length !== other.list.length)
            return false;
    
        for (let i = 0; i < this.list.length; ++i)
            if (!this.list[i].equals(other.list[i]))
                return false;
    
        return true;
    }
    
    applyMapping (map)
    {
        return new List(this.list.map(e => e.applyMapping(map)));
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        return new List(this.list.map(e => e.toSNF(status)));
    }
    
    solve (map, forward, other)
    {
        let right = other.solveOnRight(map, forward, this);
        if (right !== undefined)
            return right;
        
        if (!other instanceof List)
            return false;
        if (this.list.length !== other.list.length)
            return false;
        
        for (let i = 0; i < this.list.length; ++i)
            if (!this.list[i].solve(map, forward, other.list[i]))
                return false;
        
        return true;
    }
}

module.exports = List;