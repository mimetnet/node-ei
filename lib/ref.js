function EiRef(node, len, n, creation) {
    Object.defineProperty(this, 'node', {
        enumerable: true,
        value: node
    });
    Object.defineProperty(this, 'len', {
        enumerable: true,
        value: len
    });
    Object.defineProperty(this, 'n', {
        enumerable: true,
        value: n || new Array()
    });
    Object.defineProperty(this, 'creation', {
        enumerable: true,
        value: creation
    });
}

module.exports = EiRef;