/**
 * Inbox domain - API service.
 *
 * One service backs every screen that reads conversations or people: chat,
 * contacts, and the dashboard's activity rows. They share one dataset - a
 * contact is a list row, a thread header, a details-panel lead and a table
 * row at the same time - so splitting the surface per screen would mean
 * copies of that dataset kept in step by hand. If the screens ever need
 * separate surfaces, keep this one data module and put thin services over it.
 */

import { BaseApiService, RestEndpointProtocol, RestProtocol } from '@gears-frontx/react';
import { RestMockPlugin } from '@gears-frontx/frontx-template-shell';
import { inboxMockMap } from './mocks';
import type {
  CreateConversationRequest,
  CreateConversationResponse,
  GetAgentResponse,
  GetChannelsResponse,
  GetContactsResponse,
  GetConversationsResponse,
  GetMessagesResponse,
  PostMessageRequest,
  PostMessageResponse,
} from './types';

// @cpt-dod:cpt-template-inbox-dod-data-inbox-service:p1
// @cpt-flow:cpt-template-inbox-flow-data-read-collections:p1
// @cpt-flow:cpt-template-inbox-flow-data-post-message:p1
// @cpt-flow:cpt-template-inbox-flow-data-start-conversation:p1
export class InboxApiService extends BaseApiService {
  constructor() {
    // @cpt-begin:cpt-template-inbox-flow-data-read-collections:p1:inst-build-protocol
    const restProtocol = new RestProtocol({ timeout: 30000 });
    const restEndpoints = new RestEndpointProtocol(restProtocol);

    super({ baseURL: '/api/inbox' }, restProtocol, restEndpoints);
    // @cpt-end:cpt-template-inbox-flow-data-read-collections:p1:inst-build-protocol

    // @cpt-begin:cpt-template-inbox-flow-data-read-collections:p1:inst-declare-mock
    // The shell's mock plugin, declared without switching it on: whether mocks
    // answer is decided outside every service, by the framework's `mock()`
    // plugin each package's `init.ts` adds (see `registry.ts`).
    this.registerPlugin(restProtocol, new RestMockPlugin({ mockMap: inboxMockMap, delay: 100 }));
    // @cpt-end:cpt-template-inbox-flow-data-read-collections:p1:inst-declare-mock
  }

  // @cpt-begin:cpt-template-inbox-flow-data-read-collections:p1:inst-declare-reads
  readonly getAgent = this.protocol(RestEndpointProtocol).query<GetAgentResponse>('/me');

  readonly getChannels =
    this.protocol(RestEndpointProtocol).query<GetChannelsResponse>('/channels');

  readonly getConversations =
    this.protocol(RestEndpointProtocol).query<GetConversationsResponse>('/conversations');

  readonly getMessages =
    this.protocol(RestEndpointProtocol).query<GetMessagesResponse>('/messages');

  readonly getContacts =
    this.protocol(RestEndpointProtocol).query<GetContactsResponse>('/contacts');
  // @cpt-end:cpt-template-inbox-flow-data-read-collections:p1:inst-declare-reads

  // @cpt-begin:cpt-template-inbox-flow-data-post-message:p1:inst-declare-post
  readonly postMessage = this.protocol(RestEndpointProtocol).mutation<
    PostMessageResponse,
    PostMessageRequest
  >('POST', '/messages');
  // @cpt-end:cpt-template-inbox-flow-data-post-message:p1:inst-declare-post

  // @cpt-begin:cpt-template-inbox-flow-data-start-conversation:p1:inst-declare-create
  readonly createConversation = this.protocol(RestEndpointProtocol).mutation<
    CreateConversationResponse,
    CreateConversationRequest
  >('POST', '/conversations');
  // @cpt-end:cpt-template-inbox-flow-data-start-conversation:p1:inst-declare-create
}
