function EiPid(node, number, serial, creation) {
    Object.defineProperty(this, 'node', {
        enumerable: true,
        value: node
    });
    Object.defineProperty(this, 'number', {
        enumerable: true,
        value: number
    });
    Object.defineProperty(this, 'serial', {
        enumerable: true,
        value: serial
    });
    Object.defineProperty(this, 'creation', {
        enumerable: true,
        value: creation
    });
}

module.exports = EiPid;