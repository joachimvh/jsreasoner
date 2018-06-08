
let Term = require('./Term');

class Pattern extends Term
{
    constructor (subject, predicate, object, graph)
    {
        super();
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.graph = graph;
    }
    
    equals (other)
    {
        return other instanceof Pattern
               && this.subject.equals(other.subject)
               && this.predicate.equals(other.predicate)
               && this.object.equals(other.object)
               && this.graph.equals(other.graph);
    }
    
    applyMapping (map)
    {
        return new Pattern(this.subject.applyMapping(map), this.predicate.applyMapping(map), this.object.applyMapping(map), this.graph.applyMapping(map));
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null})
    {
        let vals = [this.subject, this.predicate, this.object, this.graph].map(x => x.toSNF(Object.assign(status, {parent: this})));
        if (vals.some(x => x.length !== 1))
            throw new Error("Pattern can not contain multiple elements in any position.");
        return new Pattern(...vals.map(x => x[0]));
    }
    
    fromSNF (parent = null)
    {
        let vals = [this.subject, this.predicate, this.object, this.graph].map(x => x.fromSNF(this));
        let triple = new Pattern(...vals.map(x => x.result));
        // fancy (and memory efficient way) to merge sets
        let mergedVars = this.mergeSets(vals.map(v => v.vars));
        let mergedOrder = this.mergeOrders(vals.map(v => v.order));
        return {result: triple, vars: mergedVars, order: mergedOrder};
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        let vals = [this.subject, this.predicate, this.object, this.graph].map(x => x.updateQuantifiers(status));
        if (vals.some(x => x.length !== 1))
            throw new Error("Pattern can not contain multiple elements in any position.");
        return new Pattern(...vals.map(x => x[0]));
    }
    
    solveDeep (map, forward, other)
    {
        return other instanceof Pattern
               && this.subject.solve(map, forward, other.subject)
               && this.predicate.solve(map, forward, other.predicate)
               && this.object.solve(map, forward, other.object)
               && this.graph.solve(map, forward, other.graph);
    }

    toString ()
    {
        return this.subject + ' ' + this.predicate + ' ' + this.object + ' ' + this.graph + '.';
    }
}

module.exports = Pattern;