interface Storage {
    name: string;
    body: object;
    proto: string;
}
/**
 * Serialize a Map into JSON
 */
declare const _default: {
    type: string;
    lookup: MapConstructor;
    shouldTransform(type: any, obj: any): boolean;
    toSerializable(map: any): Storage;
    fromSerializable(data: Storage): {};
};
export default _default;
