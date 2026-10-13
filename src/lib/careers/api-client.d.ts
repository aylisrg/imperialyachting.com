// The PMS client ships without type declarations; only what careers uses.
declare module "@hcengineering/api-client" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Client = any;
  const api: { connect(url: string, options: { token: string; workspace: string }): Promise<Client> };
  export default api;
}
