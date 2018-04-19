


class Term
{
    equals (other) { throw new Error("Not implemented yet"); }
    applyMapping (map) { throw new Error("Not implemented yet"); }
    // Current definition of SNF: scoping stops at the edge of a formula UNLESS that formula is part of an implication
    toSNF (status = {mapping: new Map(), changeQuant: false, dependencies: new Set(), parent: null}) { throw new Error("Not implemented yet"); }
    /*  TODO: returns 2 things: the new object and the dependent vars?
        problem: somehow need to know which vars are in which scope, a variable appearing in a formula might also appear in a triple outside of that formula!
            can updateQuantifiers be re-used for that?
        additionally: how to guarantee correct order for skolem dependencies?
            also return 'requirements', i.e. the order in which some quantifiers should appear?
     */
    fromSNF (parent = null) { throw new Error("Not implemented yet"); }
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0}) { throw new Error("Not implemented yet"); }

    solveDeep (map, forward, other) { throw new Error("Not implemented yet"); }
    
    solve (map, forward, other)
    {
        // TODO: can't use instanceof due to require loop, will need types
        // handle special cases for variables
        if (other.toString()[0] === '$' && other.name)
        {
            if (forward || this.toString()[0] === '$' && other.name)
                return true;

            if (map.has(other.name))
                return this.equals(map.get(other.name));
            map.set(other.name, this);
            return true;
        }

        return this.solveDeep(map, forward, other);
    }
    
    mergeOrders (orders)
    {
        if (orders.length === 0)
            return null;
        if (orders.length === 1)
            return orders[0];
        // TODO: mergesort more efficient, but how often will this occur really?
        if (orders.length > 2)
            return this.mergeOrders([orders[0], this.mergeOrders(orders.slice(1))]);
    
        let i = 0, j = 0;
        let result = [];
        // one order needs to be a subset of the order (excluding the existentials)
        while (i < orders[0].length && j < orders[1].length)
        {
            if (orders[0][i].var.equals(orders[1][j].var))
            {
                result.push(orders[0][i]);
                ++i; ++j;
            }
            else if (!orders[0][i].universal)
            {
                result.push(orders[0][i]);
                ++i;
            }
            else if (!orders[1][j].universal)
            {
                result.push(orders[1][j]);
                ++j
            }
            else
                throw new Error('Unable to merge order lists ' + orders[0] + ' and ' + orders[1]);
        }
        // only one of these loops will trigger
        while (i < orders[0].length)
            result.push(orders[0][i++]);
        while (j < orders[1].length)
            result.push(orders[1][j++]);
        return result;
    }
    
    mergeSets (sets)
    {
        return new Set(function*() { for (let set of sets) yield* set; }())
    }
}

module.exports = Term;