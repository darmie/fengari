/* jshint esversion: 6 */
"use strict";

const assert  = require('assert');

const lua     = require('./lua.js');
const lapi    = require('./lapi.js');
const lauxlib = require('./lauxlib.js');

const luaB_print = function(L) {
    let n = lapi.lua_gettop(L); /* number of arguments */
    let str = "";

    lapi.lua_getglobal(L, "tostring");
    for (let i = 1; i <= n; i++) {
        lapi.lua_pushvalue(L, -1);  /* function to be called */
        lapi.lua_pushvalue(L, i);  /* value to print */
        lapi.lua_call(L, 1, 1);
        let s = lapi.lua_tolstring(L, -1, null);
        if (s === null)
            throw new Error("'tostring' must return a string to 'print");
        if (i > 1) s = `\t${s}`;
        str = `${str}${s}`;
        lapi.lua_pop(L, 1);
    }

    console.log(str);
    return 0;
};

const luaB_tostring = function(L) {
    lauxlib.luaL_checkany(L, 1);
    lauxlib.luaL_tolstring(L, 1, null);

    return true;
};

const base_funcs = {
    "print":    luaB_print,
    "tostring": luaB_tostring,
};

const luaopen_base = function(L) {
    /* open lib into global table */
    lapi.lua_pushglobaltable(L);
    lauxlib.luaL_setfuncs(L, base_funcs, 0);
    /* set global _G */
    lapi.lua_pushvalue(L, -1);
    lapi.lua_setfield(L, -2, "_G");
    /* set global _VERSION */
    lapi.lua_pushliteral(L, lua.LUA_VERSION);
    lapi.lua_setfield(L, -2, "_VERSION");
    return true;
};

module.exports.luaB_tostring = luaB_tostring;
module.exports.luaB_print    = luaB_print;
module.exports.luaopen_base  = luaopen_base;