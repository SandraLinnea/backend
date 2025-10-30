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
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.upsertProfile = upsertProfile;
function getUsers(sb, query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const start = (_a = query.offset) !== null && _a !== void 0 ? _a : 0;
        const end = start + ((_b = query.limit) !== null && _b !== void 0 ? _b : 10) - 1;
        const res = yield sb.from("profiles").select("*", { count: "exact" }).range(start, end);
        return {
            data: (_c = res.data) !== null && _c !== void 0 ? _c : [],
            count: (_d = res.count) !== null && _d !== void 0 ? _d : 0,
            offset: start,
            limit: (_e = query.limit) !== null && _e !== void 0 ? _e : 10,
        };
    });
}
function getUser(sb, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield sb.from("profiles").select("*").eq("id", id).single();
        if (error)
            throw error;
        return data;
    });
}
function upsertProfile(sb, profile) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, error } = yield sb.from("profiles").upsert(profile).select().single();
        if (error)
            throw error;
        return data;
    });
}
