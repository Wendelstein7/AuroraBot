declare module "batching-toposort" {
  export default function batchingToposort<K extends string>(dag: Record<K, K[]>): K[][];
}
