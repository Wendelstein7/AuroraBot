import { Module } from "../Module.js";

export default class Example extends Module {
  name = "Example";
  description = "This is an example module, with no functionality.";

  async start() {}
  async stop() {}
}
