-- Basic function definition
function _G.basicFunction()
	return "hello"
end

-- Table definition
local myTable = {
	field1 = "value1",
	field2 = 123,
	nestedTable = {
		nested = true
	}
}

-- Method in a table
myTable.method = function(self)
	return self.field1
end

-- Module require
local module = require("core.api")

-- Local variable
local testVar = "test"

-- Multiple requires
local settings = require "core.settings"
local menu = require("core.menu")

-- Function with parameters
function _G.complexFunction(param1, param2)
	local result = param1 + param2
	return result
end