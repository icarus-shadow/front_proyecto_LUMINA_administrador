import {instance} from "../baseApi.tsx";

const endpoint = "elements"

export const elements = {
    getAll: function() {
        return instance.get(endpoint)
    }
}