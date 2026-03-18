import * as React from 'react';
import { Context } from '../../definitions/Component';
interface Props {
    theme?: Context;
    data: any;
}
declare class CustomInspector extends React.PureComponent<Props, any> {
    render(): JSX.Element;
    getCustomNode(data: any): JSX.Element;
    nodeRenderer(props: any): JSX.Element;
}
declare const _default: React.SFC<import("emotion-theming/types/helper").AddOptionalTo<Props & React.ClassAttributes<CustomInspector>, "theme">>;
export default _default;
