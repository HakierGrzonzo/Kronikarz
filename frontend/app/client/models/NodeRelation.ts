/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Node } from './Node';

export type NodeRelation = {
    relation_type: string;
    props: any;
    in: (Node | string);
    out: (Node | string);
    id: string;
};
