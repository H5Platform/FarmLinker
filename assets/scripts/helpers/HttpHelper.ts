export class HttpHelper {
/**
 * // GET 请求示例
async function exampleGet() {
    try {
        const response = await HttpHelper.get('https://api.example.com/data', { id: '123' });
        console.log('GET Response:', response);
    } catch (error) {
        console.error('GET Error:', error);
    }
}

// POST 请求示例
async function examplePost() {
    try {
        const response = await HttpHelper.post(
            'https://api.example.com/data',
            { name: 'John', age: 30 },
            { 'Authorization': 'Bearer token123' }
        );
        console.log('POST Response:', response);
    } catch (error) {
        console.error('POST Error:', error);
    }
}
 */

    public static openLink(url:string){
        window.open(url, "_blank");
    }

    /**
     * 发送GET请求
     * @param url 请求URL
     * @param params 可选的查询参数
     * @returns Promise<string> 响应数据
     */
    public static get(url: string, params?: Record<string, string>): Promise<string> {
        if (params) {
            const queryString = this.objectToQueryString(params);
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
        return this.request(url, 'GET');
    }

    /**
     * 发送POST请求
     * @param url 请求URL
     * @param data 可选的请求数据
     * @param headers 可选的请求头
     * @returns Promise<string> 响应数据
     */
    public static post(url: string, data?: any, headers?: Record<string, string>): Promise<string> {
        return this.request(url, 'POST', data, headers);
    }

    private static request(url: string, method: string, data?: any, headers?: Record<string, string>): Promise<string> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(xhr.statusText));
                    }
                }
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.ontimeout = () => reject(new Error('Request timeout'));

            xhr.open(method, url, true);
            
            // 设置默认的 Content-Type
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            // 设置自定义请求头
            if (headers) {
                Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
            }
            xhr.send(data ? JSON.stringify(data) : null);
        });
    }

    private static objectToQueryString(obj: Record<string, string>): string {
        return Object.keys(obj)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
    }
}