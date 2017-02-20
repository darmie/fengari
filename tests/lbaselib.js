/*jshint esversion: 6 */
"use strict";

const test       = require('tape');
const beautify   = require('js-beautify').js_beautify;

const tests      = require("./tests.js");
const getState   = tests.getState;
const toByteCode = tests.toByteCode;

const VM         = require("../src/lvm.js");
const ldo        = require("../src/ldo.js");
const lapi       = require("../src/lapi.js");
const lauxlib    = require("../src/lauxlib.js");
const lua        = require('../src/lua.js');
const linit      = require('../src/linit.js');
const CT         = lua.constant_types;


test('print', function (t) {
    let luaCode = `
        print("hello", "world", 123)
    `, L;
    
    t.plan(1);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-print");

        lapi.lua_call(L, 0, 1);

    }, "JS Lua program ran without error");
});


test('setmetatable, getmetatable', function (t) {
    let luaCode = `
        local mt = {
            __index = function ()
                print("hello")
                return "hello"
            end
        }

        local t = {}

        setmetatable(t, mt);

        return t[1], getmetatable(t)
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-setmetatable-getmetatable");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.strictEqual(
        lapi.lua_tostring(L, -2),
        "hello",
        "Correct element(s) on the stack"
    );

    t.ok(
        lapi.lua_istable(L, -1),
        "Correct element(s) on the stack"
    );
});


test('rawequal', function (t) {
    let luaCode = `
        local mt = {
            __eq = function ()
                return true
            end
        }

        local t1 = {}
        local t2 = {}

        setmetatable(t1, mt);

        return rawequal(t1, t2), t1 == t2
    `, L;
    
    t.plan(3);

    t.doesNotThrow(function () {

        let bc = toByteCode(luaCode).dataView;

        L = lauxlib.luaL_newstate();

        linit.luaL_openlibs(L);

        lapi.lua_load(L, bc, "test-rawequal");

        lapi.lua_call(L, 0, -1);

    }, "JS Lua program ran without error");

    t.notOk(
        lapi.lua_toboolean(L, -2),
        "Correct element(s) on the stack"
    );

    t.ok(
        lapi.lua_toboolean(L, -1),
        "Correct element(s) on the stack"
    );
});