import axios from 'axios';

// export const host = "https://o2api.spc.co.kr";
export const host = "https://s9rest.ngrok.io";

function client() {
    const client = axios.create({
        baseURL: host,
        // timeout: 10000,
    });
    client.interceptors.request.use(x => {
        return x;
    });
    client.interceptors.response.use(
        x => {
            return x;
        },
        x => {
            return Promise.reject(x);
        },
    );
    return client;
}

function get(request) {
    return client().get(request);
}

function post(request, body) {
    if (body) {
        return client().post(request, body);
    } else {
        return client().post(request, null);
    }
}

function patch(request, body) {
    if (body) {
        return client().patch(request, body);
    }
    else {
        return client().patch(request, null);
    }
}

export function login(userId, password) {
    const request = host + '/api/v1/login/';
    const body = {
        userId: userId,
        password: password
    };
    return post(request, body);
}

