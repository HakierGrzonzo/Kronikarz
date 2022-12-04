/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BearerResponse } from '../models/BearerResponse';
import type { Body_auth_jwt_login_api_auth_jwt_login_post } from '../models/Body_auth_jwt_login_api_auth_jwt_login_post';
import type { UserCreate } from '../models/UserCreate';
import type { UserRead } from '../models/UserRead';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AuthService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Auth:Jwt.Login
     * @param formData 
     * @returns BearerResponse Successful Response
     * @throws ApiError
     */
    public authJwtLoginApiAuthJwtLoginPost(
formData: Body_auth_jwt_login_api_auth_jwt_login_post,
): CancelablePromise<BearerResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/jwt/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Auth:Jwt.Logout
     * @returns any Successful Response
     * @throws ApiError
     */
    public authJwtLogoutApiAuthJwtLogoutPost(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/jwt/logout',
            errors: {
                401: `Missing token or inactive user.`,
            },
        });
    }

    /**
     * Register:Register
     * @param requestBody 
     * @returns UserRead Successful Response
     * @throws ApiError
     */
    public registerRegisterApiAuthRegisterPost(
requestBody: UserCreate,
): CancelablePromise<UserRead> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

}
