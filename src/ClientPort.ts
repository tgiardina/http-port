import { Port, PortMessage } from "./types";

export default class ClientPort {
  readonly name: string;
  private port: Port;

  private static create(name: string): ClientPort {
    const client = Object.create(this.prototype);
    client.name = name;
    return client;
  }

  static async connect(name: string): Promise<ClientPort> {
    const client = ClientPort.create(name);
    return new Promise((resolve) => {
      const port = browser.runtime.connect({ name: name });
      const initPort = () => {
        port.onMessage.removeListener(initPort);
        client.port = port;
        resolve(client);
      };
      port.onMessage.addListener(initPort);
    });
  }

  post(path: string, data: unknown = null): Promise<unknown> {
    return new Promise((resolve) => {
      const id = btoa(`${this.name}${path}${Date.now()}${Math.random()}`);
      this.port.postMessage({
        id,
        path,
        data: JSON.parse(JSON.stringify(data)),
      });
      const listener = (response: PortMessage<unknown>) => {
        if (response.id === id) {
          this.port.onMessage.removeListener(listener);
          resolve(response.data);
        }
      };
      this.port.onMessage.addListener(listener);
    });
  }
}
