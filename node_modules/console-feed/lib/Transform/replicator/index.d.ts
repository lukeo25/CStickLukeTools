declare class Replicator {
    transforms: any;
    transformsMap: any;
    serializer: any;
    constructor(serializer?: any);
    addTransforms(transforms: any): this;
    removeTransforms(transforms: any): this;
    encode(val: any, limit?: number): any;
    decode(val: any): any;
}
export default Replicator;
