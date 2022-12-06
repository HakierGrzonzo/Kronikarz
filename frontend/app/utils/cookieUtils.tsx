export function getCookie(request: Request, name: string) {
    const cookies = request.headers.get("Cookie")?.split(";");
    if (!cookies) {
        return undefined
    }
    const cookie = cookies?.find((c) => c.trim().startsWith(`${name}=`))?.split("=")[1]
    return cookie
}

export function deleteCookie(request: Request, name: string) {
    request.headers.set("Set-Cookie", `${name}=; Max-Age=0`)
}

export function deleteAllCookies(request: Request) {
    const cookies = request.headers.get("Set-Cookie")?.split(";");
    if (!cookies) {
        return
    }
    cookies.forEach((c) => {
        const name = c.split("=")[0]
        deleteCookie(request, name)
    })
}