function EiPort(node, id, creation) {
    Object.defineProperty(this, 'node', {
        enumerable: true,
        value: node
    });
    Object.defineProperty(this, 'id', {
        enumerable: true,
        value: number
    });
    Object.defineProperty(this, 'creation', {
        enumerable: true,
        value: creation
    });
}

module.exports = EiPort;