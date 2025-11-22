import {instance} from "../baseApi.tsx";

const endpoint = "admin/elements"

export const elements = {
    getAll: function() {
        return instance.get(endpoint)
    }
}