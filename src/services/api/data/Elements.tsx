import {instance} from "../baseApi.tsx";

const endpoint = "admin/equipos-elementos"

export const elements = {
    getAll: function() {
        return instance.get(endpoint)
    }
}