"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperties = getProperties;
exports.getProperty = getProperty;
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;
function getProperties(sb, query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const startIndex = (_a = query.offset) !== null && _a !== void 0 ? _a : 0;
        const endIndex = startIndex + ((_b = query.limit) !== null && _b !== void 0 ? _b : 10) - 1;
        const q = sb
            .from("properties")
            .select("*", { count: "exact" })
            .range(startIndex, endIndex);
        const res = yield q;
        return {
            data: res.data || [],
            count: res.count || 0,
            offset: startIndex,
            limit: (_c = query.limit) !== null && _c !== void 0 ? _c : 10,
        };
    });
}
function getProperty(sb, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield sb.from("properties").select("*").eq("property_id", id).single();
        if (error)
            throw error;
        return data;
    });
}
function createProperty(sb, property) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = sb.from("properties").insert([property]).select().single();
        const response = yield query;
        if (response.error)
            throw response.error;
        return response.data;
    });
}
function updateProperty(sb, id, property) {
    return __awaiter(this, void 0, void 0, function* () {
        const propertyWithoutId = Object.assign(Object.assign({}, property), { property_code: undefined });
        const query = sb.from("properties").update(propertyWithoutId).eq("property_code", id).select().single();
        const response = yield query;
        if (response.error)
            throw response.error;
        return response.data;
    });
}
function deleteProperty(sb, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = sb.from("properties").delete().eq("property_code", id).select().single();
        const response = yield query;
        if (response.error)
            throw response.error;
        return response.data;
    });
}
