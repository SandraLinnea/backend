"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAnonKey = exports.supabaseUrl = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const _supabaseUrl = process.env.SUPABASE_URL;
const _supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!_supabaseUrl || !_supabaseAnonKey) {
    throw new Error("Supabase not initialized add 'SUPABASE_URL' and 'SUPABASE_ANON_KEY' to enviroment variables");
}
exports.supabase = (0, supabase_js_1.createClient)(_supabaseUrl, _supabaseAnonKey);
const supabaseUrl = _supabaseUrl;
exports.supabaseUrl = supabaseUrl;
const supabaseAnonKey = _supabaseAnonKey;
exports.supabaseAnonKey = supabaseAnonKey;
