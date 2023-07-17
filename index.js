"use strict";

const ConfigurableService = require("./ConfigurableService");

let configurableService = new ConfigurableService();
let userName = configurableService.getProperty("user");
console.log(userName);

configurableService = new ConfigurableService("stage");
userName = configurableService.getProperty("user");
console.log(userName);