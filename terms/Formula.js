
let List = require("./List");

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
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        return new Formula(this.list.map(e => e.updateQuantifiers(status)));
    }

    toString ()
    {
        return '{ ' + this.list.join(' ') + ' }';
    }
}

module.exports = Formula;