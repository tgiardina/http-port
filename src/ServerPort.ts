import { Port, PortMessage } from "./types";

interface Endpoint {
  path: string;
  callback: (data: unknown) => unknown;
}

export default class ServerPort {
  readonly name: string;
  private endpoints: Endpoint[];
  private ports: Port[];

  constructor(name: string) {
    this.endpoints = [];
    this.name = name;
    this.ports = [];
    browser.runtime.onConnect.addListener((port: Port) => {
      if (port.name === name) {
        port.postMessage(null);
        this.ports.push(port);
        this.applyEndpoints(port);
      }
    });
  }

  public post(path: string, callback: (data: unknown) => unknown): void {
    this.endpoints.push({ path, callback });
  }

  private applyEndpoints(port: Port) {
    for (const endpoint of this.endpoints) {
      const listener = async (request: PortMessage<unknown>) => {
        if (request.path !== endpoint.path) return;
        const id = request.id;
        const path = request.path;
        const data = (await endpoint.callback(request.data)) || null;
        port.postMessage({
          id,
          path,
          data: JSON.parse(JSON.stringify(data)),
        });
      };
      port.onMessage.addListener(listener);
    }
  }
}
