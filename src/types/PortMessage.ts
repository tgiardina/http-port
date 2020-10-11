export interface PortMessage<T> {
  id: string;
  path: string;
  data: T;
}
