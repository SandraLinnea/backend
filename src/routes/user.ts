import { Hono } from "hono";
import * as db from "../database/user.js";
import { supabase } from "../lib/supabase.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { userQueryValidator } from "../validators/userValidator.js";
// import type { PaginatedListResponse } from "../database/property.js";

const userApp = new Hono();

userApp.get("/", userQueryValidator, async (c) => {
        const sb = c.get("supabase");
    try {
        const query = c.req.valid("query") as UserListQuery;
        const response = await db.getUsers(sb, query);
        return c.json(response);
    } catch (error) {
        return c.json([]);
    }
});

userApp.get("/:id", async (c) => {
    const sb = c.get("supabase");
})

export default userApp;