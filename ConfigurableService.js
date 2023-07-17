"use strict";

const fs = require('fs');

class ConfigurableService {
   #nodeEnv;
   #properties;
   #verbose;
   constructor(nodeEnv, verbose = false) {
      this.#verbose = verbose;
      this.#nodeEnv = nodeEnv || process.env["NODE.ENV"] || process.env["node.env"] || process.env["NODE_ENV"] || process.env["node_env"];
      const defaultProperties = this.#jsonToMap(this.#getConfigFromFile());
      const specifiedProperties = this.#jsonToMap(this.#getConfigFromFile(`./config/${this.#nodeEnv}.json`));
      const osEnvVars = this.#jsonToMap(this.#getEnvVars());
      this.#properties  = new Map([...defaultProperties, ...specifiedProperties, ...osEnvVars]);
   }

   #getConfigFromFile(path = "./config/default.json") {
      try {
         const data = fs.readFileSync(path, 'utf8');
         this.#logIfVerboseMode(`Apply properties from file: ${path}`);
         return JSON.parse(data);
      } catch (err) {
         this.#logIfVerboseMode(`Can't find file with properties: ${path}`);
      }
   }

   #logIfVerboseMode(msg) {
      if (this.#verbose) {
         console.log(msg);
      }
   }

   #getEnvVars() {
      this.#logIfVerboseMode(`Apply properties from OS environment variables`);
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
            map.set(this.#stringToKeyFormat(newKey), jsonObj[key]);
         }
      }
      return map;
   }

   #stringToKeyFormat(str) {
      return str.replace(/[._]/g, "").toLowerCase();
   }

   getProperty(property) {
      if (typeof property !== "string") {
         throw new Error(`Wrong property type. Expected type: string. Actual type: ${typeof property}`);
      }
      return this.#properties.get(this.#stringToKeyFormat(property));
   }

   setProperty(property, value) {
      if (typeof property !== "string") {
         throw new Error(`Wrong property type. Expected type: string. Actual type: ${typeof property}`);
      }
      this.#properties.set(this.#stringToKeyFormat(property), value);
   }
}

module.exports = ConfigurableService;