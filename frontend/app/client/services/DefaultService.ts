/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DefaultService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Redirect To Docs
     * Redirects the developer to the docs, if they forget to add `/docs` to
 * the url.
     * @returns void 
     * @throws ApiError
     */
    public redirectToDocsGet(): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/',
            errors: {
                307: `Successful Response`,
            },
        });
    }

}
