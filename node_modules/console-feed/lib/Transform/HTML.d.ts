interface Storage {
    tagName: string;
    attributes: {
        [attribute: string]: string;
    };
    innerHTML: string;
}
/**
 * Serialize a HTML element into JSON
 */
declare const _default: {
    type: string;
    shouldTransform(type: any, obj: any): boolean;
    toSerializable(element: HTMLElement): Storage;
    fromSerializable(data: Storage): HTMLElement | Storage;
};
export default _default;
