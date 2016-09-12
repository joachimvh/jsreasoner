
class Term
{
    equals (other) { throw new Error("Not implemented yet"); }
    applyMapping (map) { throw new Error("Not implemented yet"); }
    toSNF (status = { mapping: new Map(), changeQuant: false, dependencies: new Set()}) { throw new Error("Not implemented yet"); }
    
    solve (map, forward, other) { throw new Error("Not implemented yet"); }
    solveOnRight (map, forward, other) { return undefined; } // probably only needed for Variable.js
}

module.exports = Term;