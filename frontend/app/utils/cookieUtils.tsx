export function getCookie(request: Request, name: string) {
    const cookies = request.headers.get("Cookie")?.split(";");
    if (!cookies) {
        return undefined
    }
    const cookie = cookies?.find((c) => c.trim().startsWith(`${name}=`))?.split("=")[1]
    return cookie
}

export function cookieMaker(cookies: string[]) {
    return cookies.reduce((headers, curr) => {
        headers.append("Set-Cookie", curr);
        return headers;
    }, new Headers());
}

export function deleteCookie(name: string) {
    return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
}

export function makeCookie(name: string, value: string) {
    return `${name}=${value}`
}

export function setCookieNameAndValueToHeader(name: string, value: string) {
    return { "Set-Cookie": `${name}=${value}` }
}

export function setCookieToHeader(cookie: string) {
    return { "Set-Cookie": `${cookie}` }
}

export function deleteAllCookies(request: Request) {
    const cookies = request.headers.get("Set-Cookie")?.split(";");
    if (!cookies) {
        return
    }
    return cookies.map((c) => {
        const name = c.split("=")[0]
        return deleteCookie(name)
    })
}