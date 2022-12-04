/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Node } from '../models/Node';
import type { NodeRelation } from '../models/NodeRelation';
import type { Tree } from '../models/Tree';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DataService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Create New Tree
     * @param name 
     * @returns Tree Successful Response
     * @throws ApiError
     */
    public createNewTreeApiTreesNewPost(
name: string,
): CancelablePromise<Tree> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/trees/new',
            query: {
                'name': name,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List My Trees
     * @returns Tree Successful Response
     * @throws ApiError
     */
    public listMyTreesApiTreesMyGet(): CancelablePromise<Array<Tree>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/trees/my',
        });
    }

    /**
     * Get Detailed Tree
     * @param treeId 
     * @returns Tree Successful Response
     * @throws ApiError
     */
    public getDetailedTreeApiTreesTreeIdGet(
treeId: string,
): CancelablePromise<Tree> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/trees/{tree_id}',
            path: {
                'tree_id': treeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create New Node
     * @param treeId 
     * @param requestBody 
     * @returns Node Successful Response
     * @throws ApiError
     */
    public createNewNodeApiNodesNewTreeIdPost(
treeId: string,
requestBody: any,
): CancelablePromise<Node> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/nodes/new/{tree_id}',
            path: {
                'tree_id': treeId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Link Nodes
     * @param treeId 
     * @param inNodeId 
     * @param outNodeId 
     * @param relationType 
     * @param requestBody 
     * @returns NodeRelation Successful Response
     * @throws ApiError
     */
    public linkNodesApiNodesRelationTreeIdLinkInNodeIdOutNodeIdPost(
treeId: string,
inNodeId: string,
outNodeId: string,
relationType: string,
requestBody: any,
): CancelablePromise<NodeRelation> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/nodes/relation/{tree_id}/link/{in_node_id}/{out_node_id}',
            path: {
                'tree_id': treeId,
                'in_node_id': inNodeId,
                'out_node_id': outNodeId,
            },
            query: {
                'relation_type': relationType,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Relations For Node
     * @param treeId 
     * @param nodeId 
     * @returns NodeRelation Successful Response
     * @throws ApiError
     */
    public getRelationsForNodeApiNodesRelationsTreeIdNodeIdGet(
treeId: string,
nodeId: string,
): CancelablePromise<Array<NodeRelation>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/nodes/relations/{tree_id}/{node_id}',
            path: {
                'tree_id': treeId,
                'node_id': nodeId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
