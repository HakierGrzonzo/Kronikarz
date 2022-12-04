/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Node } from './Node';

export type Tree = {
    name: string;
    nodes: (Array<Node> | Array<string>);
    id: string;
};
