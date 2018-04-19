
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
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null})
    {
        let vals = [this.subject, this.predicate, this.object].map(x => x.toSNF(Object.assign(status, {parent: this})));
        if (vals.some(x => x.length !== 1))
            throw new Error("Triple can not contain multiple elements in any position.");
        return new Triple(...vals.map(x => x[0]));
    }
    
    fromSNF (parent = null)
    {
        let vals = [this.subject, this.predicate, this.object].map(x => x.fromSNF(this));
        let triple = new Triple(...vals.map(x => x.result));
        // fancy (and memory efficient way) to merge sets
        let mergedVars = this.mergeSets(vals.map(v => v.vars));
        let mergedOrder = this.mergeOrders(vals.map(v => v.order));
        return {result: triple, vars: mergedVars, order: mergedOrder};
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        let vals = [this.subject, this.predicate, this.object].map(x => x.updateQuantifiers(status));
        if (vals.some(x => x.length !== 1))
            throw new Error("Triple can not contain multiple elements in any position.");
        return new Triple(...vals.map(x => x[0]));
    }
    
    solveDeep (map, forward, other)
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