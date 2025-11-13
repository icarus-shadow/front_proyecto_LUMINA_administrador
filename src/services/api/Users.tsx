import {instance} from "./baseApi.tsx";

const endpoint = "users"

export const users = {
    getAll: function() {
        return instance.get(endpoint)
    }
}