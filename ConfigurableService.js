"use strict";

const fs = require('fs');

class ConfigurableService {
   #nodeEnv;
   #properties
   constructor(nodeEnv_) {
      this.#nodeEnv = nodeEnv_ || process.env["NODE.ENV"] || process.env["node.env"] || process.env["NODE_ENV"] || process.env["node_env"];
      const defaultProperties = this.#jsonToMap(this.#getConfigFromFile());
      const specifiedProperties = this.#jsonToMap(this.#getConfigFromFile(`./config/${this.#nodeEnv}.json`));
      const osEnvVars = this.#jsonToMap(this.#getEnvVars());
      this.#properties  = new Map([...defaultProperties, ...specifiedProperties, ...osEnvVars]);
   }

   #getConfigFromFile(path = "./config/default.json") {
      try {
         const data = fs.readFileSync(path, 'utf8');
         console.debug(`Apply properties from file: ${path}`);
         return JSON.parse(data);
      } catch (err) {
         console.debug(`Can't find file with properties: ${path}`);
      }
   }

   #getEnvVars() {
      console.debug(`Apply properties from OS environment variables`);
      return process.env;
   }

   #jsonToMap(jsonObj, parentKey = "") {
      let map = new Map();

      for (let key in jsonObj) {
         let newKey = `${parentKey}${parentKey ? "." : ""}${key}`;

         if (typeof jsonObj[key] === "object" && jsonObj[key] !== null && !Array.isArray(jsonObj[key])) {
            let nestedMap = this.#jsonToMap(jsonObj[key], newKey);
            for (let [nestedKey, nestedVal] of nestedMap) {
               map.set(nestedKey, nestedVal);
            }
         } else {
            newKey = newKey.replaceAll(".", "");
            newKey = newKey.replaceAll("_", "");
            newKey = newKey.toLowerCase();
            map.set(newKey, jsonObj[key]);
         }
      }
      return map;
   }

   getProperty(property) {
      if (typeof property !== "string") {
         throw new Error(`Wrong property type. Expected type: string. Actual type: ${typeof property}`);
      }
      let property_ = property.toLowerCase()
      property_.replaceAll(".", "");
      property_.replaceAll("_", "");
      return this.#properties.get(property);
   }

   setProperty(property, value) {
      if (typeof property !== "string") {
         throw new Error(`Wrong property type. Expected type: string. Actual type: ${typeof property}`);
      }
      let property_ = property.toLowerCase()
      property_.replaceAll(".", "");
      property_.replaceAll("_", "");
      return this.#properties.set(property, value);
   }
}

module.exports = ConfigurableService;