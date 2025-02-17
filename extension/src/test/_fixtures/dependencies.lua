-- Different require patterns
local api = require('core.api')
local settings = require "core.settings"
local menu = require("core.menu")

-- Relative path requires
local helper = require('./helper')
local utils = require('../utils')

-- Dot notation requires
local core = require "core"
local core_menu = require "core.menu"
local deep_module = require "core.modules.heal_engine"

-- Local module definition
local MyModule = {}

-- Using required modules
function MyModule:init()
	self.api = api
	self.settings = settings.getDefaults()
	self.menuItems = menu.getItems()
end

return MyModule