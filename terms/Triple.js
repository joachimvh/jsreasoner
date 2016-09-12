
var Term = require('./Term');

class Triple extends Term
{
    constructor (subject, predicate, object)
    {
        super();
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
    }
    
    equals (other)
    {
        return other instanceof Triple
                && this.subject.equals(other.subject)
                && this.predicate.equals(other.predicate)
                && this.object.equals(other.object);
    }
    
    applyMapping (map)
    {
        return new Triple(this.subject.applyMapping(map), this.predicate.applyMapping(map), this.object.applyMapping(map));
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        return new Triple(this.subject.toSNF(status), this.predicate.toSNF(status), this.object.toSNF(status));
    }
    
    solve (map, forward, other)
    {
        let right = other.solveOnRight(map, forward, this);
        if (right !== undefined)
            return right;
        
        return other instanceof Triple
                && this.subject.solve(map, forward, other.subject)
                && this.predicate.solve(map, forward, other.predicate)
                && this.object.solve(map, forward, other.object);
    }
}

module.exports = Triple;