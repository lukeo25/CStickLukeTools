interface Storage {
    name: string;
    body: string;
    proto: string;
}
/**
 * Serialize a function into JSON
 */
declare const _default: {
    type: string;
    lookup: FunctionConstructor;
    shouldTransform(type: any, obj: any): boolean;
    toSerializable(func: Function): Storage;
    fromSerializable(data: Storage): Storage | (() => void);
};
export default _default;
