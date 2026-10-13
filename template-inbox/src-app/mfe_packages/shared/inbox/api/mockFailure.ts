/**
 * How a mock factory refuses a request.
 *
 * The shell's `RestMockPlugin` answers every mapped request with its factory's value as a 200; it has no way to answer with another status. A backend refuses a malformed write with a 4xx, and the screens show that failure, so a factory that refuses throws a `MockRequestError` instead: the protocol hands a plugin's exception to its error chain and rejects the call with it, the way an HTTP error rejects a real request. The error carries the status a backend would answer with and no `data` field, since `RestProtocol` reads an error carrying both `status` and `data` as a response a plugin recovered with.
 */
// @cpt-dod:cpt-template-inbox-dod-data-refusal:p1
// @cpt-algo:cpt-template-inbox-algo-data-refuse:p1
// @cpt-begin:cpt-template-inbox-algo-data-refuse:p1:inst-carry-status
export class MockRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'MockRequestError';
    this.status = status;
  }
}
// @cpt-end:cpt-template-inbox-algo-data-refuse:p1:inst-carry-status

/** Refuses the request with `status`, as the backend this mock stands for would. */
// @cpt-begin:cpt-template-inbox-algo-data-refuse:p1:inst-throw-refusal
export const refuseRequest = (status: number, message: string): never => {
  throw new MockRequestError(status, message);
};
// @cpt-end:cpt-template-inbox-algo-data-refuse:p1:inst-throw-refusal
