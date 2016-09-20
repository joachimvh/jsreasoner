
class Term
{
    equals (other) { throw new Error("Not implemented yet"); }
    applyMapping (map) { throw new Error("Not implemented yet"); }
    toSNF (status = { mapping: new Map(), changeQuant: false, dependencies: new Set()}) { throw new Error("Not implemented yet"); }
    updateQuantifiers (variables = new Set()) { throw new Error("Not implemented yet"); }
    
    solveAsRight (map, forward, other) { return undefined; } // probably only needed for Variable.js
    solveAsLeft (map, forward, other) { throw new Error("Not implemented yet"); }
    
    solve (map, forward, other)
    {
        let right = other.solveAsRight(map, forward, this);
        if (right !== undefined)
            return right;
        return this.solveAsLeft(map, forward, other);
    }
}

module.exports = Term;