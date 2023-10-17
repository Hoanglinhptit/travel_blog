import { RedisClientType, createClient } from "redis";

const client: RedisClientType = createClient({
  url: "redis://default@192.168.70.134:6379",
});

export { client };
