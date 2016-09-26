
let List = require("./List");
let Implication = require ('./Implication');

class Formula extends List
{
    // TODO: should ignore order?
    applyMapping (map)
    {
        return new Formula(this.list.map(e => e.applyMapping(map)));
    }
    
    toSNF (status = { map: new Map(), changeQuant: false, dependencies: new Set(), parent: null})
    {
        // if the parent isn't an implication scoping needs to stay within the formula
        if (!(status.parent instanceof Implication))
            status = { map: status.map, changeQuant: false, dependencies: status.dependencies, parent: this};
        return [new Formula([].concat(...this.list.map(e => e.toSNF(Object.assign(status, {parent: this})))))];
    }
    
    updateQuantifiers (status = {variables: new Map(), nameIdx: 0})
    {
        return [new Formula([].concat(...this.list.map(e => e.updateQuantifiers(status))))];
    }

    toString ()
    {
        return '{ ' + this.list.join(' ') + ' }';
    }
}

module.exports = Formula;