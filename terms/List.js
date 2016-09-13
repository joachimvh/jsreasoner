
let Term = require('./Term');
let _ = require('lodash');

class List extends Term
{
    constructor (list)
    {
        super();
        if (!_.isArray(list))
            throw new Error("Input should be an array.");
        this.list = list;
    }
    
    equals (other)
    {
        if (!(other instanceof List))
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
    
    solveAsLeft (map, forward, other)
    {
        if (!(other instanceof List))
            return false;
        if (this.list.length !== other.list.length)
            return false;
        
        for (let i = 0; i < this.list.length; ++i)
            if (!this.list[i].solve(map, forward, other.list[i]))
                return false;
        
        return true;
    }

    toString ()
    {
        return '( ' + this.list.join(' ') + ' )';
    }
}

module.exports = List;