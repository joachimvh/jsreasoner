
var List = require("./List");

class Formula extends List
{
    // TODO: should ignore order?
    applyMapping (map)
    {
        return new Formula(this.list.map(e => e.applyMapping(map)));
    }
    
    // TODO: need to preserve status when stepping out of formula again
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set()})
    {
        return new Formula(this.list.map(e => e.toSNF(status)));
    }
}

module.exports = Formula;