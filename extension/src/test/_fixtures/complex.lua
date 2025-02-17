-- Module definition pattern
local ComplexModule = {}

-- Class-like structure
function ComplexModule:new()
	local instance = setmetatable({}, { __index = self })
	return instance
end

-- Method with multiple parameters and nested function
function ComplexModule:process(data, options)
	local function innerFunction(input)
		return input * 2
	end
	
	return innerFunction(data)
end

-- Multiple dependency patterns
local api = require('core.api')
local settings = require('core.settings')
local menu = require "core.menu"

-- Table with mixed types and nested structures
ComplexModule.config = {
	enabled = true,
	callbacks = {
		onUpdate = function() return true end,
		onRender = function() return false end
	},
	data = {
		numbers = {1, 2, 3},
		strings = {'a', 'b', 'c'}
	}
}

return ComplexModule