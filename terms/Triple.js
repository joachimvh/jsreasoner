
let Term = require('./Term');

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
    
    // TODO: similarity between toSNF and updateQuantifiers
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        let s = this.subject.toSNF(status);
        let p = this.predicate.toSNF(status);
        let o = this.object.toSNF(status);
        if (s.length !== 1 || p.length !== 1 || o.length !== 1)
            throw new Error("Triple can not contain multiple elements in any position.");
        return new Triple(s[0], p[0], o[0]);
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        let s = this.subject.updateQuantifiers(status);
        let p = this.predicate.updateQuantifiers(status);
        let o = this.object.updateQuantifiers(status);
        if (s.length !== 1 || p.length !== 1 || o.length !== 1)
            throw new Error("Triple can not contain multiple elements in any position.");
        return new Triple(s[0], p[0], o[0]);
    }
    
    solveAsLeft (map, forward, other)
    {
        return other instanceof Triple
                && this.subject.solve(map, forward, other.subject)
                && this.predicate.solve(map, forward, other.predicate)
                && this.object.solve(map, forward, other.object);
    }

    toString ()
    {
        return this.subject + ' ' + this.predicate + ' ' + this.object + '.';
    }
}

module.exports = Triple;